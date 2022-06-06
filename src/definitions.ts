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
    };
  }
}

export type CallbackID = string;

export interface DocumnentReference {
  reference: string;
}

export type DocumentSnapshot<T> = (data: T | null, err?: any) => void;

export interface CapacitorFirestorePlugin {
  addDocumentSnapshotListener<T>(options: DocumnentReference, callback: DocumentSnapshot<T>): Promise<CallbackID>;
}
