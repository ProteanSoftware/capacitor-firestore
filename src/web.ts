import { WebPlugin } from '@capacitor/core';

import type {
  CallbackId,
  CapacitorFirestorePlugin,
  CollectionSnapshotCallback,
  ColllectionReference,
  CustomToken,
  DocumentSnapshotCallback,
  DocumnentReference,
  RemoveSnapshotListener
} from './definitions';

export class CapacitorFirestoreWeb extends WebPlugin implements CapacitorFirestorePlugin {
  public addDocumentSnapshotListener<T>(options: DocumnentReference, callback: DocumentSnapshotCallback<T>): Promise<CallbackId> {
    callback({
      id: '1',
      data: {
        item: 1
      } as unknown as T
    });

    return Promise.reject("Not implemented - " + options.reference);
  }

  public addCollectionSnapshotListener<T>(options: ColllectionReference, callback: CollectionSnapshotCallback<T>): Promise<CallbackId> {
    callback({
      collection: [
        {
          id: '1',
          data: {
            item: 1
          } as unknown as T
        }
      ]
    });

    return Promise.reject("Not implemented - " + options.reference);
  }

  public removeSnapshotListener(options: RemoveSnapshotListener): Promise<void> {
    return Promise.reject("Not implemented - " + options.callbackId);
  }

  public signInWithCustomToken(options: CustomToken): Promise<void> {
    console.log(options.token);
    return Promise.reject("Not implemented");
  }
}
