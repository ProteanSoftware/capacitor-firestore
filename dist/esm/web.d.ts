import { WebPlugin } from '@capacitor/core';
import type { CallbackID, CapacitorFirestorePlugin, DocumentSnapshot, DocumnentReference } from './definitions';
export declare class CapacitorFirestoreWeb extends WebPlugin implements CapacitorFirestorePlugin {
    addDocumentSnapshotListener<T>(options: DocumnentReference, callback: DocumentSnapshot<T>): Promise<CallbackID>;
}
