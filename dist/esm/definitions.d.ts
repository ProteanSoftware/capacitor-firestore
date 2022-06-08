declare module "@capacitor/cli" {
    interface PluginsConfig {
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
export declare type CallbackId = string;
export declare type QueryOperators = "==" | ">=" | "<=" | "<" | ">" | "array-contains";
export declare function createQueryConstraint(field: string, operator: QueryOperators, value: any): QueryConstraint;
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
export declare type DocumentSnapshotCallback<T> = (data: DocumentSnapshot<T> | null, err?: any) => void;
export declare type CollectionSnapshotCallback<T> = (data: CollectionSnapshot<T> | null, err?: any) => void;
export interface CapacitorFirestorePlugin {
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
     * Listen for snapshot changes on a document.
     * @param options
     * @param callback
     * @returns The callback id which can be used to remove the listener.
     */
    addDocumentSnapshotListener<T>(options: DocumnentReference, callback: DocumentSnapshotCallback<T>): Promise<CallbackId>;
    /**
     * Reads the document referred to by this DocumentReference
     * @param options
     * @returns The document snapshot
     */
    getDocument<T>(options: DocumnentReference): Promise<DocumentSnapshot<T>>;
    /**
     * Listen for snapshot changes on a collection.
     * @param options
     * @param callback
     * @returns The callback id which can be used to remove the listener.
     */
    addCollectionSnapshotListener<T>(options: ColllectionReference, callback: CollectionSnapshotCallback<T>): Promise<CallbackId>;
    /**
     * Stop listening for snapshot changes on a document or collection.
     * @param options
     */
    removeSnapshotListener(options: RemoveSnapshotListener): Promise<void>;
}
