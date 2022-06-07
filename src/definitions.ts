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

       /**
       * Set the Firebase api key
       *
       * @since 1.0.0
       * @example "XxxxxxxxxxxXXxxxxxxxxx"
       */
        apiKey?: string;
    };
  }
}

export type CallbackId = string;

export type QueryOperators = "==" | ">=" | "<=" | "<" | ">" | "array-contains";

export function createQueryConstraint(field: string, operator: QueryOperators, value: any): QueryConstraint {
  return {
    fieldPath: field,
    opStr: operator,
    value: value
  };
}

export interface QueryConstraint {
  fieldPath: string;
  opStr: QueryOperators;
  value: any;
}

export interface ColllectionReference extends DocumnentReference {
  queryConstraints?: QueryConstraint[];
}

export interface DocumnentReference {
  reference: string;
}

export interface DocumentSnapshot<T> {
   /**
   * The id of the document.
   *
   * @since 1.0.0
   */
  id: string;

  /**
   * The fields of the document or null if the document doesn't exist.
   *
   * @since 1.0.0
   */
  data?: T;
}

export interface CollectionSnapshot<T> {
  collection: DocumentSnapshot<T>[];
}

export interface CustomToken {
  token: string;
}

export interface RemoveSnapshotListener {
  callbackId: CallbackId;
}

export type DocumentSnapshotCallback<T> = (data: DocumentSnapshot<T> | null, err?: any) => void;

export type CollectionSnapshotCallback<T> = (data: CollectionSnapshot<T> | null, err?: any) => void;

export interface CapacitorFirestorePlugin {
  signInWithCustomToken(options: CustomToken): Promise<void>;
  addDocumentSnapshotListener<T>(options: DocumnentReference, callback: DocumentSnapshotCallback<T>): Promise<CallbackId>;
  addCollectionSnapshotListener<T>(options: ColllectionReference, callback: CollectionSnapshotCallback<T>): Promise<CallbackId>;
  removeSnapshotListener(options: RemoveSnapshotListener): Promise<void>;
}
