import { WebPlugin } from '@capacitor/core';
import type { CallbackId, CapacitorFirestorePlugin, CollectionSnapshot, CollectionSnapshotCallback, CollectionReference, CustomToken, DocumentSnapshot, DocumentSnapshotCallback, DocumnentReference, FirestoreConfig, RemoveSnapshotListener, UpdateDocument, SetDocument } from './definitions';
export declare class CapacitorFirestoreWeb extends WebPlugin implements CapacitorFirestorePlugin {
    private app;
    private firestore;
    private subscriptions;
    initializeFirestore(options: FirestoreConfig): Promise<void>;
    addDocumentSnapshotListener<T>(options: DocumnentReference, callback: DocumentSnapshotCallback<T>): Promise<CallbackId>;
    getDocument<T>(options: DocumnentReference): Promise<DocumentSnapshot<T>>;
    updateDocument<T>(options: UpdateDocument<T>): Promise<void>;
    setDocument<T>(options: SetDocument<T>): Promise<void>;
    deleteDocument(options: DocumnentReference): Promise<void>;
    addCollectionSnapshotListener<T>(options: CollectionReference, callback: CollectionSnapshotCallback<T>): Promise<CallbackId>;
    getCollection<T>(options: CollectionReference): Promise<CollectionSnapshot<T>>;
    removeSnapshotListener(options: RemoveSnapshotListener): Promise<void>;
    signInWithCustomToken(options: CustomToken): Promise<void>;
}
