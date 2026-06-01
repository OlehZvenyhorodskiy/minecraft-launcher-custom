# ZonkLauncher — гипероптимизированный пиратский лаунчер для Minecraft 1.21.8

Проект собирает с нуля кастомный десктоп-лаунчер на Electron+React с авто-установкой Fabric 1.21.8 и набора оптимизационных модов, плюс собственный Fabric-мод `ZonkOptimizer`, который через Mixin-патчи режет ненужные частицы/анимации/тики прямо в коде Minecraft, оставляя только PvP-критичные эффекты.

---

## 1. Стек и инструменты

| Слой | Технология | Зачем |
|---|---|---|
| UI shell | **Electron 32** | Лучший UI-движок (TailwindCSS + shadcn/ui + Framer Motion), готовая Minecraft-экосистема |
| Frontend | **React 18 + TypeScript + Vite** | Современный DX, типобезопасность |
| Стили | **TailwindCSS 4 + shadcn/ui + lucide-react** | Красивый, тёмный, премиум-вид |
| State | **Zustand** | Легковесный, без бойлерплейта |
| Backend (main process) | **Node.js (TS)** через electron IPC | Запуск процессов, файловая система |
| Game launcher core | **`@xmcl/core` + `@xmcl/installer`** (от Voxelum) | Самые поддерживаемые либы для запуска MC, поддержка Fabric/Forge/Quilt, парсинг version manifest |
| Microsoft auth | **`msmc`** | Стандарт для Microsoft Xbox Live → MC token flow |
| ely.by auth | Прямые HTTP-запросы к `authserver.ely.by` + JVM agent `authlib-injector` | TLauncher-style cracked-friendly авторизация со скинами |
| Modrinth API | `fetch` к `api.modrinth.com/v2` | Авто-загрузка модов |
| Java runtime | **Adoptium Temurin 21** (auto-download через API) | Нужен для 1.21.8, кладём в `%APPDATA%/ZonkLauncher/runtime/` |
| Custom mod | **Fabric Loom + Mixin** (Java 21, Gradle) | Свой мод `ZonkOptimizer` |
| Сборка | **electron-builder** | NSIS-установщик для Windows |
| Тесты | **Vitest** (unit) + **Playwright** (e2e UI) + ручной FPS-бенч в игре | |

---

## 2. Структура проекта

```
c:/Projects/Minecraft launcher/
├── launcher/                     # Electron-приложение
│   ├── src/
│   │   ├── main/                 # Electron main (Node)
│   │   │   ├── index.ts
│   │   │   ├── ipc.ts
│   │   │   ├── services/
│   │   │   │   ├── auth/         # offline, ely.by, msmc
│   │   │   │   ├── java/         # download Temurin 21
│   │   │   │   ├── minecraft/    # установка ванилы + Fabric
│   │   │   │   ├── mods/         # Modrinth API, авто-установка
│   │   │   │   ├── profiles/     # CRUD профилей
│   │   │   │   └── launch/       # сборка JVM-args, запуск
│   │   │   └── store/            # electron-store (settings.json)
│   │   ├── renderer/             # React UI
│   │   │   ├── pages/            # Home, News, Profiles, Settings, Mods, Skins
│   │   │   ├── components/       # shadcn/ui + кастом
│   │   │   ├── hooks/
│   │   │   ├── stores/           # Zustand stores
│   │   │   └── styles/
│   │   └── shared/               # types, constants
│   ├── resources/                # иконки, дефолтные пресеты, authlib-injector.jar
│   ├── package.json
│   └── electron-builder.yml
│
├── zonk-optimizer/               # Кастомный Fabric-мод
│   ├── src/main/java/dev/zonk/optimizer/
│   │   ├── ZonkOptimizer.java
│   │   ├── config/Config.java
│   │   └── mixin/
│   │       ├── ParticleManagerMixin.java
│   │       ├── EntityRendererMixin.java
│   │       ├── LivingEntityMixin.java
│   │       ├── WorldRendererMixin.java
│   │       └── ...
│   ├── src/main/resources/
│   │   ├── fabric.mod.json
│   │   ├── zonk-optimizer.mixins.json
│   │   └── assets/zonk-optimizer/
│   ├── build.gradle
│   └── gradle.properties
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── MODS.md
│   └── TESTING.md
└── README.md
```

---

## 3. Этапы (фазы) разработки

### Фаза 0 — Bootstrap (день 1)
- Создать монорепо: `launcher/` (Electron+React+TS) и `zonk-optimizer/` (Fabric mod).
- Настроить Vite + Electron + Tailwind + shadcn + ESLint + Prettier.
- Скелет UI: sidebar (Главная / Профили / Моды / Скины / Настройки), хедер с ником, кнопка PLAY.

### Фаза 1 — Профили и Java (день 2-3)
- Загрузка Adoptium Temurin 21 (Windows x64) в `%APPDATA%/ZonkLauncher/runtime/jdk-21/`.
- Парсинг version manifest от Mojang, скачивание `1.21.8` (client.jar + libraries + assets).
- Установка Fabric Loader 0.16+ для 1.21.8 через `@xmcl/installer/fabric`.
- CRUD профилей в `profiles.json`: name, mcVersion, modLoader, modList, jvmArgs, ramMin/Max, gameDir.

### Фаза 2 — Авторизация (день 4)
- **Offline**: ввод никнейма → генерация `offlinePlayerUuid(name)` (детерминированный UUID).
- **Microsoft**: `msmc` → device code flow → Xbox Live → Minecraft token.
- **ely.by**: JSON POST `authserver.ely.by/auth/authenticate`, сохранение `accessToken`, при запуске игры передаём JVM-аргумент `-javaagent:authlib-injector.jar=ely.by`.
- UI: страница входа с тремя вкладками, сохранение аккаунтов в `accounts.json` (зашифровано через electron `safeStorage`).

### Фаза 3 — Modrinth + авто-установка модов (день 5-6)
- Profile creation wizard: `New Optimized 1.21.8`.
- При первом запуске профиля: для каждого мода из списка делаем `GET /v2/project/{slug}/version?game_versions=["1.21.8"]&loaders=["fabric"]`, берём первый совместимый, качаем `.jar` в `<profile>/mods/`.
- Прогресс-бар в UI, кэш в `cache/mods/`.
- Возможность вручную добавлять моды через UI (drag&drop + поиск Modrinth).

### Фаза 4 — ZonkOptimizer (день 7-9)
- Свой Fabric-мод (см. секцию 5). Билдится отдельно (Gradle), кладётся в `launcher/resources/bundled-mods/zonk-optimizer-{ver}.jar`, при создании профиля копируется в `mods/` (без Modrinth).

### Фаза 5 — Запуск и пресеты (день 10)
- Сборка JVM-аргументов (см. секцию 6) с авто-расчётом heap (см. секцию 7).
- Авто-генерация `options.txt` с агрессивными пресетами при первом запуске профиля.
- Iris/Sodium конфиги — кладём готовые `sodium-options.json`, `iris.properties` в `<profile>/config/`.
- Кнопка PLAY → spawn JVM, hide launcher (опционально), лог-окно.

### Фаза 6 — Полировка UI (день 11-12)
- Анимации (Framer Motion), скины-превью, новости (RSS Mojang), changelog лаунчера.
- Settings: путь до `.minecraft`, выбор RAM (слайдер), кастомные JVM-args, выбор Java.
- Тёмная тема по умолчанию + светлая, акцент `#7C3AED` (фиолетовый).

### Фаза 7 — Тесты и сборка (день 13-14)
- Vitest для services (auth, modrinth, profile).
- Playwright e2e: создать профиль → запустить → проверить, что процесс жив.
- electron-builder: NSIS installer `ZonkLauncher-Setup-x64.exe`.
- Бенчмарк: чистая 1.21.8 vs ZonkLauncher на одной локации (запись через F3 averages).

---

## 4. Список авто-устанавливаемых модов (Fabric 1.21.8)

| # | Мод | Что делает | Slug Modrinth |
|---|---|---|---|
| 1 | **Fabric API** | Базовая зависимость | `fabric-api` |
| 2 | **Sodium** 0.7.x | Полная замена рендера, +200-400% FPS | `sodium` |
| 3 | **Lithium** 0.18.x | Оптимизация игровой логики, AI, физики | `lithium` |
| 4 | **FerriteCore** | -30-50% RAM на чанках | `ferrite-core` |
| 5 | **ImmediatelyFast** | Ускорение immediate-rendering (UI, частицы) | `immediatelyfast` |
| 6 | **ModernFix** | Куча мелких патчей производительности | `modernfix` |
| 7 | **Krypton** | Оптимизация сетевого стека | `krypton` |
| 8 | **C2ME** | Параллельная загрузка/генерация чанков | `c2me-fabric` |
| 9 | **More Culling** | Не рендерим скрытые грани/энтити | `moreculling` |
| 10 | **Entity Culling** | Frustum + occlusion culling сущностей | `entityculling` |
| 11 | **Dynamic FPS** | Снижает FPS в свёрнутом окне (экономия батареи) | `dynamic-fps` |
| 12 | **ThreadTweak** (Smooth Boot) | Tweaks worker thread pools | `threadtweak` |
| 13 | **Memory Leak Fix** | Лечит известные утечки | `memoryleakfix` |
| 14 | **Debugify** | Бэкпорт фиксов багов из снапшотов | `debugify` |
| 15 | **Reese's Sodium Options** | Удобный UI настроек Sodium | `reeses-sodium-options` |
| 16 | **Sodium Extra** | Дополнительные тоглы (облака, погода, баннеры) | `sodium-extra` |
| 17 | **Indium** | Совместимость FRAPI ↔ Sodium | `indium` |
| 18 | **Iris Shaders** 1.9.6 | Поддержка шейдеров (OptiFine-compat) | `iris` |
| 19 | **Continuity** | Connected textures (cosmetic, по умолчанию off) | `continuity` |
| 20 | **Enhanced Block Entities** | Оптимизация рендера сундуков/баннеров | `enhanced-block-entities` |
| 21 | **Cull Less Leaves** | Прозрачные листья = меньше вершин | `cull-less-leaves` |
| 22 | **Concurrent Chunk** (если нет в C2ME) | — | — |
| 23 | **Mod Menu** | UI списка модов в игре | `modmenu` |
| 24 | **No Chat Reports** | Privacy + меньше пакетов | `no-chat-reports` |
| 25 | **ZonkOptimizer** (свой) | Mixin-патчи частиц, тиков, анимаций | bundled |

> Перед каждой загрузкой проверяем, что версия мода реально существует под 1.21.8 — fallback на ближайшую совместимую (1.21.7).

---

## 5. ZonkOptimizer — кастомный Fabric-мод

**Цель**: то, что нельзя достичь готовыми модами — патчинг исходников MC через Mixin.

### 5.1 Mixin-патчи

| Класс MC | Метод | Что делаем |
|---|---|---|
| `ParticleManager` | `addParticle(ParticleEffect, ...)` | Сверяем тип частицы с allowlist в конфиге; если нет — `return null` (не спавним вообще). Это убирает рендер + спавн на источнике. |
| `LivingEntity` | `tickMovement` / `tick` | Если сущность вне frustum **и** дальше N блоков от игрока — пропускаем cosmetic-код (idle-анимации, breathing particles). |
| `WorldRenderer` | `renderWeather` | По флагу `disableRain=true` — `cancel`, осадки не рендерятся. |
| `WorldRenderer` | `renderClouds` | По флагу `disableClouds=true` — `cancel`. |
| `BlockEntityRenderDispatcher` | `render` | Distance culling (агрессивнее ванили). |
| `Entity` | `getRenderDistanceMultiplier` | Возвращаем меньшее значение для итем-фреймов, картин, дропа. |
| `MinecraftClient` | `tick` | Ограничиваем FPS в меню/паузе до 30 (как Dynamic FPS, но жёстче). |
| `ChunkBuilder` | `upload` | Батчим аплоад чанков чаще (меньше стутер). |
| `BiomeColors` | `getColor` | Если `biomeBlend=0` — кэш на 1 значение, без вызова. |
| `Screen` | `renderBackground` | Убираем размытие в инвентаре (стоит дорого на iGPU). |

### 5.2 Allowlist частиц (PvP-режим)

Оставляем (всё остальное — `return`):
```
crit, enchanted_hit, sweep_attack, totem_of_undying,
witch (для splash potion), instant_effect, effect (зелья),
entity_effect, dragon_breath, end_rod (стрелы с Power),
campfire_signal_smoke (видимость огня),
flame (горение игрока — критично),
splash, bubble, bubble_pop (вода — видимость),
portal (видимость порталов на аренах),
sonic_boom (Warden, видимость атаки),
trial_spawner_detection (PvE).
```

Убираем (по умолчанию):
```
ash, white_ash, spore_blossom_air, falling_dust,
falling_water, dripping_water, dripping_lava,
mycelium, warped_spore, crimson_spore,
cherry_leaves, pale_oak_leaves,
firefly, glow, end_rod (декор),
note, heart, angry_villager, happy_villager,
poof (по желанию — спавн мобов), explosion_emitter (только для эффекта),
campfire_cosy_smoke (декор), smoke, large_smoke,
bubble_column_up, current_down,
underwater, dust, dust_color_transition,
squid_ink, glow_squid_ink, scrape, wax_off, wax_on,
electric_spark, soul, soul_fire_flame,
sculk_charge, sculk_charge_pop, sculk_soul, shriek,
vibration, item_slime, item_snowball,
landing_lava, landing_obsidian_tear, landing_honey,
falling_honey, falling_nectar, falling_obsidian_tear,
falling_spore_blossom, dolphin, fishing,
small_flame, white_smoke, gust, small_gust, gust_emitter_large,
trial_omen, raid_omen, ominous_spawning,
egg_crack, dust_pillar, dust_plume,
cherry_leaves, infested, item_cobweb,
block_marker, block_crumble.
```

(Конфигурируется в `config/zonk-optimizer.json5` — пользователь может переключать пресеты: `pvp`, `vanilla`, `potato`, `custom`.)

### 5.3 Конфиг (пример)

```json5
{
  "particles": {
    "preset": "pvp",
    "customAllowlist": ["minecraft:crit", "minecraft:enchanted_hit"]
  },
  "rendering": {
    "disableRain": true,
    "disableSnow": true,
    "disableClouds": true,
    "disableScreenBlur": true,
    "blockEntityRenderDistance": 32
  },
  "entities": {
    "skipOffscreenAnimations": true,
    "tickRangeMultiplier": 0.6
  },
  "misc": {
    "menuFpsCap": 30,
    "logSpam": false
  }
}
```

---

## 6. JVM-аргументы (Aikar's flags, адаптированные под клиент)

```
-Xms2G
-Xmx<dynamic>G
-XX:+UnlockExperimentalVMOptions
-XX:+UseG1GC
-XX:G1NewSizePercent=30
-XX:G1MaxNewSizePercent=40
-XX:G1HeapRegionSize=8M
-XX:G1ReservePercent=20
-XX:G1HeapWastePercent=5
-XX:G1MixedGCCountTarget=4
-XX:InitiatingHeapOccupancyPercent=15
-XX:G1MixedGCLiveThresholdPercent=90
-XX:G1RSetUpdatingPauseTimePercent=5
-XX:SurvivorRatio=32
-XX:MaxTenuringThreshold=1
-XX:+ParallelRefProcEnabled
-XX:+AlwaysPreTouch
-XX:+DisableExplicitGC
-XX:+PerfDisableSharedMem
-XX:MaxGCPauseMillis=200
-Dfml.ignoreInvalidMinecraftCertificates=true
-Dfml.ignorePatchDiscrepancies=true
```

### 7. Авто-расчёт heap

При запуске считаем доступную RAM (`os.totalmem()`) и предлагаем:
- ≤ 8 GB total → `-Xmx4G`
- 16 GB → **`-Xmx10G`** (по запросу пользователя)
- 32 GB → `-Xmx16G`
- ≥ 64 GB → `-Xmx20G` (больше смысла нет на клиенте)

Слайдер в Settings даёт ручную override.

---

## 8. Дефолтный `options.txt` (пресет «Performance»)

```
renderDistance:8
simulationDistance:6
maxFps:260
particles:1            # 0=all, 1=decreased, 2=minimal
graphicsMode:0         # fast
ao:1
biomeBlendRadius:0
clouds:false
fancyGraphics:false
entityShadows:false
entityDistanceScaling:0.5
mipmapLevels:0
fov:0.8                # ~85
guiScale:2
useVbo:true
chatVisibility:0
hideMatchedNames:true
autoSuspend:false
attackIndicator:1
gamma:1.0              # яркость макс
```

И отдельно `config/sodium-options.json` с `quality.weather=NONE`, `quality.clouds=OFF`, `performance.use_no_error_glcontext=true`, `performance.use_persistent_mapping=true`.

---

## 9. UI / UX

- **Боковая панель** (тёмная, акцент фиолетовый): Home, Profiles, Mods, Skins, Settings.
- **Home**: большая кнопка PLAY, выбранный профиль, последняя версия, RAM-индикатор, новости.
- **Profiles**: карточки профилей, кнопка «Создать оптимизированный 1.21.8» (one-click).
- **Mods**: список + поиск Modrinth + переключатели вкл/выкл.
- **Skins**: загрузка скина (для ely.by — через их API; для offline — локальный файл и инжект через authlib-injector custom skin server).
- **Settings**: Java path, RAM-слайдер, кастомные JVM-args, путь к game dir, прокси, проверка обновлений.
- Анимации входа карточек, hover-эффекты, glassmorphism на header.

---

## 10. Тестирование

### 10.1 Unit (Vitest)
- `auth/offline.spec.ts` — UUID детерминирован.
- `auth/elyby.spec.ts` — обработка success/error JSON.
- `mods/modrinth.spec.ts` — корректный запрос версий, fallback при отсутствии 1.21.8.
- `profiles/manager.spec.ts` — CRUD, сериализация.
- `launch/jvm-args.spec.ts` — корректная сборка с heap-расчётом.

### 10.2 e2e (Playwright)
- Запуск лаунчера → создание offline-аккаунта → создание профиля «Optimized 1.21.8» → клик PLAY → assert процесс javaw.exe жив.

### 10.3 Бенчмарк FPS (ручной)
Сценарии (одно и то же seed `0`, координаты `100 80 100`, день, рендер-дистанция 12):
1. Vanilla 1.21.8 (без модов).
2. ZonkLauncher (все моды + ZonkOptimizer preset=pvp).
3. ZonkLauncher (preset=potato).

Метрики: avg FPS (F3), 1% low, RAM-пик, время загрузки чанка. Записать в `docs/BENCHMARKS.md`.

Целевые показатели на средней машине (i5-10400, GTX 1660, 16 GB):
- Vanilla: ~120 FPS
- ZonkLauncher pvp: **350+ FPS**
- ZonkLauncher potato: **600+ FPS**

---

## 11. Риски и оговорки

- **Анти-чит**: ZonkOptimizer патчит клиент. На серверах с anti-cheat (Vulcan, Grim, Matrix) удаление частиц/анимаций не должно триггерить, т.к. серверу плевать на клиентские partikли, но изменение `tickMovement` может — поэтому это делаем **только клиентски** (без отправки в сеть). Разделим конфиг: `safeMode=true` отключает рискованные мiксины.
- **Совместимость модов**: версии меняются. План — пиннить версии в `default-modlist.json` и валидировать при загрузке (если несовместимо — показывать пользователю warning).
- **Лицензия Mojang**: лаунчер требует от пользователя самостоятельно владеть игрой; offline-режим формально нарушает EULA Mojang, но это техническая возможность, ответственность на пользователе (как у TLauncher). В UI показываем дисклеймер при первом запуске.
- **Распространение модов**: Modrinth API позволяет автоматическую загрузку, лицензии большинства модов (LGPL/MIT) это разрешают. Не реджиструем моды у себя, всегда тянем с первоисточника.
- **Сборка ZonkOptimizer**: требует JDK 21 + Gradle. Билд встраиваем в CI (опционально), пока — локальная сборка → копия в `launcher/resources/bundled-mods/`.

---

## 12. Что выйдет в финале

- `ZonkLauncher-Setup-x64.exe` (NSIS, ~120 МБ) — устанавливает лаунчер.
- При первом запуске: тёмный premium UI, выбор offline/MS/ely.by, one-click создание профиля «Optimized 1.21.8», авто-загрузка JDK 21 + Fabric + 24 модов + ZonkOptimizer.
- Кнопка PLAY → запуск с агрессивными JVM-args, оптимизированным `options.txt`, и Minecraft, в котором отрезаны все косметические партиклы кроме PvP-релевантных.
- **FPS-боост 3-5x** на типовом железе.

---

## 13. Что НЕ входит в этот спринт (можно добавить потом)

- Поддержка Forge / NeoForge (только Fabric для 1.21.8).
- Поддержка Linux/macOS (Windows-first; стек кросс-платформенный, портнуть позже).
- Встроенный браузер серверов / friends-list / voice chat.
- Маркетплейс модпаков (только готовый «Optimized 1.21.8»).
- Античит-валидация модов (полагаемся на серверы).

---

## 14. Готовность к реализации

После твоего «погнали» начну с **Фазы 0** (бутстрап репо), не разбивая всё на 14 дней — буду делать максимально параллельно, и держать тебя в курсе по фазам. Ожидаемое время на работающую альфу (запуск 1.21.8 с модами): **первые ~6 фаз = ~70% задач** в пределах одной длинной сессии.
