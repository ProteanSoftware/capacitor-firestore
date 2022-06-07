/// <reference types="@capacitor/cli" />

declare module "@capacitor/cli" {
  export interface PluginsConfig {
    CapacitorFirestore?: {
      /**
       * Set the GCP/Firebase project id
       *
       * @since 1.0.0
       * @example "my-first-project"
       */
      projectId?: string;

      /**
       * Set the Firebase application id
       *
       * @since 1.0.0
       * @example "1:00000000000:web:abc00000000000000000"
       */
       applicationId?: string;
    };
  }
}

export type CallbackID = string;

export interface DocumnentReference {
  reference: string;
}

export interface CustomToken {
  token: string;
}

export type DocumentSnapshot<T> = (data: T | null, err?: any) => void;

export interface CapacitorFirestorePlugin {
  signInWithCustomToken(options: CustomToken): Promise<void>;
  addDocumentSnapshotListener<T>(options: DocumnentReference, callback: DocumentSnapshot<T>): Promise<CallbackID>;
}
