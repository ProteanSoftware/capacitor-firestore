import { WebPlugin } from '@capacitor/core';

import type { CallbackID, CapacitorFirestorePlugin, CustomToken, DocumentSnapshotCallback, DocumnentReference } from './definitions';

export class CapacitorFirestoreWeb extends WebPlugin implements CapacitorFirestorePlugin {
  public addDocumentSnapshotListener<T>(options: DocumnentReference, callback: DocumentSnapshotCallback<T>): Promise<CallbackID> {
    callback({
        id: '1',
        data: {
          item: 1
        } as unknown as T
    });
    return Promise.resolve(options.reference);
  }

  public signInWithCustomToken(options: CustomToken): Promise<void> {
    console.log(options.token);
    return Promise.resolve();
  }
}
