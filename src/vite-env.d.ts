/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional HTTPS issue tracker or contact page shown in the footer. */
  readonly VITE_CONTACT_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
