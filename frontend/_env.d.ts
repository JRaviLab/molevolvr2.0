/// <reference types="vite/client" />

/** type defs for .env file */
// eslint-disable-next-line
interface ImportMetaEnv {
  readonly VITE_TITLE: string;
  readonly VITE_DESCRIPTION: string;
  readonly VITE_URL: string;
  readonly VITE_API: string;
  readonly VITE_REPO: string;
  readonly VITE_ISSUES: string;
  readonly VITE_EMAIL: string;
  readonly VITE_LAB_NAME: string;
  readonly VITE_LAB_WEBSITE: string;
  readonly VITE_LAB_GITHUB: string;
}

// eslint-disable-next-line
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
