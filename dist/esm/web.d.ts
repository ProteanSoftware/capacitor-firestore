import { WebPlugin } from '@capacitor/core';
import type { CallbackId, CapacitorFirestorePlugin, CollectionSnapshot, CollectionSnapshotCallback, CustomToken, DocumentSnapshot, DocumentSnapshotCallback, DocumentReference, FirestoreConfig, RemoveSnapshotListener, UpdateDocument, SetDocument, AddDocument, DocumnentQuery, CollectionQuery } from './definitions';
export declare class CapacitorFirestoreWeb extends WebPlugin implements CapacitorFirestorePlugin {
    private app;
    private firestore;
    private subscriptions;
    initializeFirestore(options: FirestoreConfig): Promise<void>;
    addDocumentSnapshotListener<T>(options: DocumnentQuery, callback: DocumentSnapshotCallback<T>): Promise<CallbackId>;
    getDocument<T>(options: DocumnentQuery): Promise<DocumentSnapshot<T>>;
    updateDocument<T>(options: UpdateDocument<T>): Promise<void>;
    setDocument<T>(options: SetDocument<T>): Promise<void>;
    deleteDocument(options: DocumnentQuery): Promise<void>;
    addDocument<T>(options: AddDocument<T>): Promise<DocumentReference>;
    addCollectionSnapshotListener<T>(options: CollectionQuery, callback: CollectionSnapshotCallback<T>): Promise<CallbackId>;
    getCollection<T>(options: CollectionQuery): Promise<CollectionSnapshot<T>>;
    removeSnapshotListener(options: RemoveSnapshotListener): Promise<void>;
    signInWithCustomToken(options: CustomToken): Promise<void>;
}
