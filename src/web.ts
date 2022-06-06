import { WebPlugin } from '@capacitor/core';

import type { CallbackID, CapacitorFirestorePlugin, DocumentSnapshot, DocumnentReference } from './definitions';

export class CapacitorFirestoreWeb extends WebPlugin implements CapacitorFirestorePlugin {
  public addDocumentSnapshotListener<T>(options: DocumnentReference, callback: DocumentSnapshot<T>): Promise<CallbackID> {
    callback({
      item: 1
    } as unknown as T);
    return Promise.resolve(options.reference);
  }
}
