import { useEffect, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Download,
  FolderOpen,
  Gauge,
  HardDrive,
  Home,
  ListChecks,
  LogIn,
  Play,
  Puzzle,
  Rocket,
  Settings,
  ShieldCheck,
  Terminal,
  UserRound
} from "lucide-react";
import { DEFAULT_MODS, PRESET_LABELS } from "@shared/catalog";
import type { LauncherProfile, OptimizationPreset } from "@shared/types";
import { useLauncherStore, type PageKey } from "./stores/launcherStore";

const navItems: Array<{ key: PageKey; label: string; icon: typeof Home }> = [
  { key: "home", label: "Home", icon: Home },
  { key: "profiles", label: "Profiles", icon: UserRound },
  { key: "mods", label: "Mods", icon: Puzzle },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "logs", label: "Logs", icon: Terminal }
];

function formatBytes(bytes: number): string {
  if (!bytes) return "0 MB";
  const mb = bytes / 1024 / 1024;
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
}

function Sidebar(): JSX.Element {
  const page = useLauncherStore((state) => state.page);
  const setPage = useLauncherStore((state) => state.setPage);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">Z</div>
        <div>
          <strong>ZonkLauncher</strong>
          <span>Fabric performance</span>
        </div>
      </div>
      <nav>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={page === item.key ? "nav-item active" : "nav-item"}
              onClick={() => setPage(item.key)}
              title={item.label}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function Header(): JSX.Element {
  const accounts = useLauncherStore((state) => state.accounts);
  const login = useLauncherStore((state) => state.login);
  const busy = useLauncherStore((state) => state.busy);
  const active = accounts.find((account) => account.active);

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Licensed Minecraft optimization client</p>
        <h1>Zonk Performance Console</h1>
      </div>
      <button className="secondary-button" onClick={login} disabled={busy} title="Microsoft sign-in">
        {active ? <CheckCircle2 size={18} /> : <LogIn size={18} />}
        <span>{active ? active.username : "Microsoft"}</span>
      </button>
    </header>
  );
}

function ProfilePicker(): JSX.Element {
  const profiles = useLauncherStore((state) => state.profiles);
  const selectedProfileId = useLauncherStore((state) => state.selectedProfileId);
  const selectProfile = useLauncherStore((state) => state.selectProfile);

  return (
    <select value={selectedProfileId ?? ""} onChange={(event) => selectProfile(event.target.value)}>
      {profiles.map((profile) => (
        <option key={profile.id} value={profile.id}>
          {profile.name}
        </option>
      ))}
    </select>
  );
}

function HomePage(): JSX.Element {
  const profiles = useLauncherStore((state) => state.profiles);
  const accounts = useLauncherStore((state) => state.accounts);
  const system = useLauncherStore((state) => state.system);
  const selectedProfileId = useLauncherStore((state) => state.selectedProfileId);
  const createProfile = useLauncherStore((state) => state.createProfile);
  const installProfile = useLauncherStore((state) => state.installProfile);
  const launchProfile = useLauncherStore((state) => state.launchProfile);
  const busy = useLauncherStore((state) => state.busy);
  const profile = profiles.find((entry) => entry.id === selectedProfileId) ?? profiles[0];
  const activeAccount = accounts.find((account) => account.active);

  return (
    <main className="page-grid">
      <section className="launch-panel">
        <div className="launch-copy">
          <p className="eyebrow">Selected profile</p>
          <h2>{profile?.name ?? "No profile yet"}</h2>
          <div className="chip-row">
            <span className="chip"><ShieldCheck size={14} /> Microsoft auth</span>
            <span className="chip"><Gauge size={14} /> {profile?.optimizationPreset ?? "pvp"}</span>
            <span className="chip"><Cpu size={14} /> {profile?.ramMaxGb ?? system?.recommendedHeapGb ?? 8} GB</span>
          </div>
        </div>
        <div className="launch-actions">
          {profiles.length > 0 && <ProfilePicker />}
          <button className="primary-button" onClick={launchProfile} disabled={busy || !profile || !activeAccount}>
            <Play size={22} />
            <span>PLAY</span>
          </button>
          <button className="secondary-button" onClick={installProfile} disabled={busy || !profile}>
            <Download size={18} />
            <span>Install</span>
          </button>
          <button className="ghost-button" onClick={createProfile} disabled={busy}>
            <Rocket size={18} />
            <span>New optimized</span>
          </button>
        </div>
      </section>

      <section className="metric-strip">
        <article>
          <Cpu size={20} />
          <span>RAM</span>
          <strong>{system ? `${system.totalMemoryGb} GB` : "..."}</strong>
        </article>
        <article>
          <Gauge size={20} />
          <span>Heap</span>
          <strong>{system ? `${system.recommendedHeapGb} GB` : "..."}</strong>
        </article>
        <article>
          <HardDrive size={20} />
          <span>Java</span>
          <strong>{system?.javaPath ?? "javaw.exe"}</strong>
        </article>
      </section>

      <section className="status-band">
        <ListChecks size={22} />
        <div>
          <strong>{activeAccount ? "Ready for licensed launch" : "Microsoft sign-in required"}</strong>
          <span>{profile ? profile.gameDir : "Create an optimized profile to prepare files."}</span>
        </div>
      </section>
    </main>
  );
}

function ProfilesPage(): JSX.Element {
  const profiles = useLauncherStore((state) => state.profiles);
  const selectedProfileId = useLauncherStore((state) => state.selectedProfileId);
  const selectProfile = useLauncherStore((state) => state.selectProfile);
  const createProfile = useLauncherStore((state) => state.createProfile);
  const saveProfile = useLauncherStore((state) => state.saveProfile);
  const busy = useLauncherStore((state) => state.busy);

  return (
    <main className="content-stack">
      <div className="section-heading">
        <h2>Profiles</h2>
        <button className="secondary-button" onClick={createProfile} disabled={busy}>
          <Rocket size={18} />
          <span>New optimized</span>
        </button>
      </div>
      <div className="profile-grid">
        {profiles.map((profile) => (
          <article key={profile.id} className={profile.id === selectedProfileId ? "profile-card selected" : "profile-card"}>
            <button className="card-hit" onClick={() => selectProfile(profile.id)} />
            <div className="profile-head">
              <div>
                <strong>{profile.name}</strong>
                <span>{profile.gameVersion} / Fabric</span>
              </div>
              <span className="mini-pill">{PRESET_LABELS[profile.optimizationPreset]}</span>
            </div>
            <label>
              Preset
              <select
                value={profile.optimizationPreset}
                onChange={(event) =>
                  saveProfile({ ...profile, optimizationPreset: event.target.value as OptimizationPreset })
                }
              >
                {Object.entries(PRESET_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              RAM
              <input
                type="number"
                min={2}
                max={24}
                value={profile.ramMaxGb}
                onChange={(event) => saveProfile({ ...profile, ramMaxGb: Number(event.target.value) })}
              />
            </label>
            <p className="path-line">{profile.gameDir}</p>
          </article>
        ))}
      </div>
    </main>
  );
}

function ModsPage(): JSX.Element {
  const profiles = useLauncherStore((state) => state.profiles);
  const selectedProfileId = useLauncherStore((state) => state.selectedProfileId);
  const resolvedMods = useLauncherStore((state) => state.resolvedMods);
  const resolveMods = useLauncherStore((state) => state.resolveMods);
  const downloadMods = useLauncherStore((state) => state.downloadMods);
  const busy = useLauncherStore((state) => state.busy);
  const profile = profiles.find((entry) => entry.id === selectedProfileId) ?? profiles[0];
  const enabled = useMemo(() => new Set(profile?.modSlugs ?? []), [profile]);

  return (
    <main className="content-stack">
      <div className="section-heading">
        <h2>Mods</h2>
        <div className="button-row">
          <button className="secondary-button" onClick={resolveMods} disabled={busy || !profile}>
            <Gauge size={18} />
            <span>Resolve</span>
          </button>
          <button className="primary-button compact" onClick={downloadMods} disabled={busy || !profile}>
            <Download size={18} />
            <span>Download</span>
          </button>
        </div>
      </div>
      <div className="mods-table">
        {DEFAULT_MODS.map((mod) => {
          const resolved = resolvedMods.find((entry) => entry.slug === mod.slug);
          return (
            <div key={mod.slug} className="mod-row">
              <div>
                <strong>{mod.name}</strong>
                <span>{mod.slug}</span>
              </div>
              <span className="category">{mod.category}</span>
              <span>{enabled.has(mod.slug) ? "enabled" : "off"}</span>
              <span>{resolved ? resolved.version : "not resolved"}</span>
              <span>{resolved ? formatBytes(resolved.size) : "-"}</span>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function SettingsPage(): JSX.Element {
  const settings = useLauncherStore((state) => state.settings);
  const system = useLauncherStore((state) => state.system);
  const saveSettings = useLauncherStore((state) => state.saveSettings);
  const busy = useLauncherStore((state) => state.busy);

  if (!settings) return <main className="content-stack">Loading...</main>;

  return (
    <main className="settings-grid">
      <section>
        <h2>Settings</h2>
        <label>
          Java path
          <input
            value={settings.javaPath ?? ""}
            placeholder={system?.javaPath ?? "javaw.exe"}
            onChange={(event) => saveSettings({ javaPath: event.target.value || undefined })}
            disabled={busy}
          />
        </label>
        <label>
          Minecraft root
          <input
            value={settings.minecraftRoot ?? ""}
            placeholder={system?.appDataDir ?? ""}
            onChange={(event) => saveSettings({ minecraftRoot: event.target.value || undefined })}
            disabled={busy}
          />
        </label>
      </section>
      <section>
        <h2>Performance</h2>
        <label>
          Default RAM
          <input
            type="number"
            min={2}
            max={24}
            value={settings.defaultRamMaxGb}
            onChange={(event) => saveSettings({ defaultRamMaxGb: Number(event.target.value) })}
            disabled={busy}
          />
        </label>
        <label className="toggle-line">
          <input
            type="checkbox"
            checked={settings.closeLauncherOnGameStart}
            onChange={(event) => saveSettings({ closeLauncherOnGameStart: event.target.checked })}
            disabled={busy}
          />
          Close launcher on start
        </label>
        <label className="toggle-line">
          <input
            type="checkbox"
            checked={settings.enableVerboseLogs}
            onChange={(event) => saveSettings({ enableVerboseLogs: event.target.checked })}
            disabled={busy}
          />
          Verbose logs
        </label>
      </section>
    </main>
  );
}

function LogsPage(): JSX.Element {
  const logs = useLauncherStore((state) => state.logs);

  return (
    <main className="content-stack">
      <div className="section-heading">
        <h2>Logs</h2>
        <span className="mini-pill">{logs.length}</span>
      </div>
      <div className="log-list">
        {logs.map((log, index) => (
          <div key={`${log.scope}-${index}`} className={`log-row ${log.level}`}>
            {log.level === "error" ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            <span>{log.scope}</span>
            <strong>{log.message}</strong>
            {typeof log.progress === "number" && <em>{Math.round(log.progress * 100)}%</em>}
          </div>
        ))}
      </div>
    </main>
  );
}

function Page(): JSX.Element {
  const page = useLauncherStore((state) => state.page);
  if (page === "profiles") return <ProfilesPage />;
  if (page === "mods") return <ModsPage />;
  if (page === "settings") return <SettingsPage />;
  if (page === "logs") return <LogsPage />;
  return <HomePage />;
}

export function App(): JSX.Element {
  const load = useLauncherStore((state) => state.load);
  const pushTask = useLauncherStore((state) => state.pushTask);

  useEffect(() => {
    void load();
    return window.zonk.onTaskEvent(pushTask);
  }, [load, pushTask]);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="workspace">
        <Header />
        <Page />
      </div>
    </div>
  );
}