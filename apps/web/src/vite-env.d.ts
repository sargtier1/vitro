/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// TanStack Router type declaration
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof import('./main').router
  }
}