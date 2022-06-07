import { WebPlugin } from '@capacitor/core';
import type { CallbackID, CapacitorFirestorePlugin, CustomToken, DocumentSnapshotCallback, DocumnentReference } from './definitions';
export declare class CapacitorFirestoreWeb extends WebPlugin implements CapacitorFirestorePlugin {
    addDocumentSnapshotListener<T>(options: DocumnentReference, callback: DocumentSnapshotCallback<T>): Promise<CallbackID>;
    signInWithCustomToken(options: CustomToken): Promise<void>;
}
