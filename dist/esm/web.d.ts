import { WebPlugin } from '@capacitor/core';
import type { CallbackId, CapacitorFirestorePlugin, CollectionSnapshotCallback, ColllectionReference, CustomToken, DocumentSnapshot, DocumentSnapshotCallback, DocumnentReference, FirestoreConfig, RemoveSnapshotListener } from './definitions';
export declare class CapacitorFirestoreWeb extends WebPlugin implements CapacitorFirestorePlugin {
    private app;
    private firestore;
    private subscriptions;
    initializeFirestore(options: FirestoreConfig): Promise<void>;
    addDocumentSnapshotListener<T>(options: DocumnentReference, callback: DocumentSnapshotCallback<T>): Promise<CallbackId>;
    getDocument<T>(options: DocumnentReference): Promise<DocumentSnapshot<T>>;
    addCollectionSnapshotListener<T>(options: ColllectionReference, callback: CollectionSnapshotCallback<T>): Promise<CallbackId>;
    removeSnapshotListener(options: RemoveSnapshotListener): Promise<void>;
    signInWithCustomToken(options: CustomToken): Promise<void>;
}
