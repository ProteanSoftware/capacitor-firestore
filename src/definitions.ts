/* eslint-disable no-prototype-builtins */
/// <reference types="@capacitor/cli" />

import { Timestamp } from "firebase/firestore";

declare module "@capacitor/cli" {
  export interface PluginsConfig {
    CapacitorFirestore?: FirestoreConfig;
  }
}

export interface FirestoreConfig {
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
}

export type CallbackId = string;

/**
 * Filter conditions in a {@link QueryConstraint} clause are specified using the
 * strings '&lt;', '&lt;=', '==', '&gt;=', '&gt;', 'array-contains'
 */
export type QueryOperators = "==" | ">=" | "<=" | "<" | ">" | "array-contains";

/**
 *
 * @param field The path to compare
 * @param operator The operation string (e.g "&lt;", "&lt;=", "==", "&lt;",
 * "&lt;=", "!=", "array-contains")
 * @param value The value for comparison
 * @returns The created {@link QueryConstraint}.
 */
export function createQueryConstraint(field: string, operator: QueryOperators, value: any): QueryConstraint {
  return {
    fieldPath: field,
    opStr: operator,
    value: value,
  };
}

export function prepDataForFirestore<T>(data: T): T {
  for (const prop in data) {
    if (data[prop] instanceof Timestamp) {
      const timestamp = data[prop] as unknown as Timestamp;
      data[prop] = {
        specialType: "Timestamp",
        seconds: timestamp.seconds,
        nanoseconds: timestamp.nanoseconds,
      } as any;
    } else if (data[prop] instanceof Array) {
      (data[prop] as unknown as any[]).forEach((element) => {
        element = prepDataForFirestore(element);
      });
    }

    if (data[prop] === undefined) {
      delete data[prop];
    }
  }

  return data;
}

export function processDocumentData(data: any): void {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const element = data[key];
      if (element instanceof Object && element.hasOwnProperty("specialType")) {
        switch (element.specialType) {
          case "Timestamp":
            data[key] = new Timestamp(element.seconds, element.nanoseconds);
            break;
          default:
            throw new Error("Unknown specialType: " + element.specialType);
        }
      } else if (element instanceof Array) {
        (element as unknown as any[]).forEach((item) => {
          processDocumentData(item);
        });
      }
    }
  }
}

/**
 * A `QueryConstraint` is used to narrow the set of documents returned by a
 * Firestore query.
 */
export interface QueryConstraint {
  /**
   * The path to compare
   */
  fieldPath: string;

  /**
   * The operation string (e.g "&lt;", "&lt;=", "==", "&lt;",
   * "&lt;=", "!=", "array-contains")
   */
  opStr: QueryOperators;

  /**
   * The value for comparison
   */
  value: any;
}

export interface CollectionQuery extends DocumnentQuery {
  queryConstraints?: QueryConstraint[];
}

export interface DocumnentQuery {
  /**
   * A reference to the document/collection
   */
  reference: string;
}

export interface DocumentReference {
  /**
   * The id of the document.
   *
   * @since 1.0.0
   */
  id: string;

  /**
   * A string representing the path of the referenced document (relative
   * to the root of the database).
   * @since 1.0.0
   */
  path: string;
}

export interface DocumentSnapshot<T> extends DocumentReference {
  /**
   * The fields of the document or null if the document doesn't exist.
   *
   * @since 1.0.0
   */
  data: T | null;
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

export interface UpdateDocument<T> extends DocumnentQuery {
  /**
   * An object containing the fields and values with which to
   * update the document. Fields can contain dots to reference nested fields
   * within the document
   */
  data: Partial<T>;
}

export interface SetDocument<T> extends DocumnentQuery {
  /**
   * A map of the fields and values for the document.
   */
  data: T;

  /**
   * Changes the behavior of a `setDocument()` call to only replace the
   * values specified in its data argument. Fields omitted from the `setDocument()`
   * call remain untouched. If your input sets any field to an empty map, all
   * nested fields are overwritten.
   */
  merge?: boolean;
}

export interface AddDocument<T> extends DocumnentQuery {
  /**
   * An Object containing the data for the new document.
   */
  data: T;
}

export interface PendingActions {
  count: number;
}

export type DocumentSnapshotCallback<T> = (data: DocumentSnapshot<T> | null, err?: any) => void;

export type CollectionSnapshotCallback<T> = (data: CollectionSnapshot<T> | null, err?: any) => void;

export interface CapacitorFirestorePlugin {
  /**
   * Gets the number of pending write actions (i.e. setDocument, addDocument, updateDocument, deleteDocument)
   */
  getPendingActions(): Promise<PendingActions>;

  /**
   * Configure the firestore instance with new configuration options.
   * @param options
   */
  initializeFirestore(options: FirestoreConfig): Promise<void>;

  /**
   * Login to firestore using a customer JWT token.
   * @param options
   */
  signInWithCustomToken(options: CustomToken): Promise<void>;

  /**
   * Sign out of firestore.
   */
  signOut(): Promise<void>;

  /**
   * Reads the document referred to by this DocumnentQuery
   * @param options
   * @returns The document snapshot
   */
  getDocument<T>(options: DocumnentQuery): Promise<DocumentSnapshot<T>>;

  /**
   * Updates fields in the document referred to by the specified DocumnentQuery.
   * The update will fail if applied to a document that does not exist.
   * @param options
   * @returns A `Promise` resolved once the data has been successfully written
   * to the backend (note that it won't resolve while you're offline).
   */
  updateDocument<T>(options: UpdateDocument<T>): Promise<void>;

  /**
   * Writes to the document referred to by the specified DocumnentQuery.
   * If the document does not yet exist, it will be created.
   * If you provide merge or mergeFields, the provided data can be merged into an existing document.
   * @param options
   * @returns A Promise resolved once the data has been successfully written
   * to the backend (note that it won't resolve while you're offline).
   */
  setDocument<T>(options: SetDocument<T>): Promise<void>;

  /**
   * Deletes the document referred to by the specified DocumnentQuery.
   * @param options
   * @returns A Promise resolved once the document has been successfully
   * deleted from the backend (note that it won't resolve while you're offline).
   */
  deleteDocument(options: DocumnentQuery): Promise<void>;

  /**
   * Add a new document to specified `CollectionQuery` with the given data,
   * assigning it a document ID automatically.
   * @param options
   * @returns A `Promise` resolved with a `DocumentReference` pointing to the
   * newly created document after it has been written to the backend (Note that it
   * won't resolve while you're offline).
   */
  addDocument<T>(options: AddDocument<T>): Promise<DocumentReference>;

  /**
   * Listen for snapshot changes on a document.
   * @param options
   * @param callback
   * @returns The callback id which can be used to remove the listener.
   */
  addDocumentSnapshotListener<T>(options: DocumnentQuery, callback: DocumentSnapshotCallback<T>): Promise<CallbackId>;

  /**
   * Executes the query and returns the results as a CollectionSnapshot
   * @param options
   * @returns The collection snapshot
   */
  getCollection<T>(options: CollectionQuery): Promise<CollectionSnapshot<T>>;

  /**
   * Listen for snapshot changes on a collection.
   * @param options
   * @param callback
   * @returns The callback id which can be used to remove the listener.
   */
  addCollectionSnapshotListener<T>(
    options: CollectionQuery,
    callback: CollectionSnapshotCallback<T>
  ): Promise<CallbackId>;

  /**
   * Stop listening for snapshot changes on a document or collection.
   * @param options
   */
  removeSnapshotListener(options: RemoveSnapshotListener): Promise<void>;

  /**
   * Remove all active snapshot listners
   */
  clearAllSnapshotListeners(): Promise<void>;

  /**
   * Re-enables use of the network for this Firestore instance after a prior
   * call to {@link disableNetwork}.
   *
   * @returns A `Promise` that is resolved once the network has been enabled.
   */
  enableNetwork(): Promise<void>;

  /**
   * Disables network usage for this instance. It can be re-enabled via {@link enableNetwork}.
   * While the network is disabled, any snapshot listeners, {@link getDocument}
   * or {@link getCollection} calls will return results from cache, and any write
   * operations will be queued until the network is restored.
   *
   * @returns A `Promise` that is resolved once the network has been disabled.
   */
  disableNetwork(): Promise<void>;
}
