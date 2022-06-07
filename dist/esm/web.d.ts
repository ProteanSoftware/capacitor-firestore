import { WebPlugin } from '@capacitor/core';
import type { CallbackId, CapacitorFirestorePlugin, CustomToken, DocumentSnapshotCallback, DocumnentReference, RemoveSnapshotListener } from './definitions';
export declare class CapacitorFirestoreWeb extends WebPlugin implements CapacitorFirestorePlugin {
    addDocumentSnapshotListener<T>(options: DocumnentReference, callback: DocumentSnapshotCallback<T>): Promise<CallbackId>;
    removeSnapshotListener(options: RemoveSnapshotListener): Promise<void>;
    signInWithCustomToken(options: CustomToken): Promise<void>;
}
