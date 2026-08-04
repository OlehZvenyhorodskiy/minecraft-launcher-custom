/// <reference types="vite/client" />

import type { ZonkApi } from "@shared/types";

declare global {
  interface Window {
    zonk: ZonkApi;
  }
}