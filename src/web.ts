import { WebPlugin } from '@capacitor/core';
import { initializeApp, deleteApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import type { Firestore, Query, Unsubscribe } from "firebase/firestore";
import { initializeFirestore as firestoreInitialize, terminate, enableIndexedDbPersistence, onSnapshot, doc, collection, query, where, CACHE_SIZE_UNLIMITED } from "firebase/firestore";

import type {
  CallbackId,
  CapacitorFirestorePlugin,
  CollectionSnapshotCallback,
  ColllectionReference,
  CustomToken,
  DocumentSnapshotCallback,
  DocumnentReference,
  FirestoreConfig,
  RemoveSnapshotListener
} from './definitions';

export class CapacitorFirestoreWeb extends WebPlugin implements CapacitorFirestorePlugin {
  private app: FirebaseApp | null = null;
  private firestore: Firestore | null = null;

  private subscriptions: { [id: string]: Unsubscribe; } = {};

  public initializeFirestore(options: FirestoreConfig): Promise<void> {
    let teardownPromise = Promise.resolve();

    if (this.firestore !== null) {
      teardownPromise = terminate(this.firestore);
    }

    teardownPromise = teardownPromise.then(() => {
      if (this.app !== null) {
        deleteApp(this.app);
      }
    });

    const initPromise = teardownPromise.then(() => {
      const app = initializeApp({
        apiKey: options.apiKey,
        appId: options.applicationId,
        projectId: options.projectId
      }, "CapacitorFirestore");

      this.app = app;

      const firestore = firestoreInitialize(app, {
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
      });

      return firestore;
    });

    return initPromise.then(firestore => {
      enableIndexedDbPersistence(firestore).then(() => {
        this.firestore = firestore;
      });
    });
  }

  public addDocumentSnapshotListener<T>(options: DocumnentReference, callback: DocumentSnapshotCallback<T>): Promise<CallbackId> {
    if (this.firestore === null) {
      return Promise.reject("Firestore not initialized");
    }

    const unSubFunc = onSnapshot(doc(this.firestore, options.reference), snapshot => {
      callback({
        id: snapshot.id,
        data: snapshot.exists() ? snapshot.data() as T : null
      });
    });

    const id = new Date().getTime().toString();
    this.subscriptions[id] = unSubFunc;

    return Promise.resolve(id);
  }

  public addCollectionSnapshotListener<T>(options: ColllectionReference, callback: CollectionSnapshotCallback<T>): Promise<CallbackId> {
    if (this.firestore === null) {
      return Promise.reject("Firestore not initialized");
    }

    let collectionQuery: Query;
    if (options.queryConstraints) {
      const constraints = options.queryConstraints.map(constraint => where(constraint.fieldPath, constraint.opStr, constraint.value));
      collectionQuery =  query(collection(this.firestore, options.reference), ...constraints);
    } else {
      collectionQuery = query(collection(this.firestore, options.reference));
    }

    const unSubFunc = onSnapshot(collectionQuery, snapshot => {
      callback({
        collection: snapshot.docs.map(doc => {
          return {
            id: doc.id,
            data: doc.data() as T
          };
        })
      });
    });

    const id = new Date().getTime().toString();
    this.subscriptions[id] = unSubFunc;

    return Promise.resolve(id);
  }

  public removeSnapshotListener(options: RemoveSnapshotListener): Promise<void> {
    const unSubFunc = this.subscriptions[options.callbackId];

    if (unSubFunc === undefined) {
      return Promise.reject("No callback with id " + options.callbackId);
    }

    unSubFunc();
    delete this.subscriptions[options.callbackId];

    return Promise.resolve();
  }

  public signInWithCustomToken(options: CustomToken): Promise<void> {
    if (this.app === null) {
      return Promise.reject("app not initialized");
    }

    const auth = getAuth(this.app);
    return signInWithCustomToken(auth, options.token).then();
  }
}
