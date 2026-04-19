/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** e.g. https://xxxxx.execute-api.ap-south-2.amazonaws.com/default/lessons */
  readonly VITE_LESSONS_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
