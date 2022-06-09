import { WebPlugin } from '@capacitor/core';
import { initializeApp, deleteApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import type { Firestore, Query, Unsubscribe } from "firebase/firestore";
import {
  initializeFirestore,
  terminate,
  enableIndexedDbPersistence,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  CACHE_SIZE_UNLIMITED
} from "firebase/firestore";

import type {
  CallbackId,
  CapacitorFirestorePlugin,
  CollectionSnapshot,
  CollectionSnapshotCallback,
  CollectionReference,
  CustomToken,
  DocumentSnapshot,
  DocumentSnapshotCallback,
  DocumnentReference,
  FirestoreConfig,
  RemoveSnapshotListener,
  UpdateDocument,
  SetDocument
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

      const firestore = initializeFirestore(app, {
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
        path: snapshot.ref.path,
        data: snapshot.exists() ? snapshot.data() as T : null
      });
    });

    const id = new Date().getTime().toString();
    this.subscriptions[id] = unSubFunc;

    return Promise.resolve(id);
  }

  public getDocument<T>(options: DocumnentReference): Promise<DocumentSnapshot<T>> {
    if (this.firestore === null) {
      return Promise.reject("Firestore not initialized");
    }

    return getDoc(doc(this.firestore, options.reference)).then(snapshot => {
      return {
        id: snapshot.id,
        path: snapshot.ref.path,
        data: snapshot.exists() ? snapshot.data() as T : null
      };
    });
  }

  public updateDocument<T>(options: UpdateDocument<T>): Promise<void> {
    if (this.firestore === null) {
      return Promise.reject("Firestore not initialized");
    }

    return updateDoc(doc(this.firestore, options.reference), options.data as T);
  }

  public setDocument<T>(options: SetDocument<T>): Promise<void> {
    if (this.firestore === null) {
      return Promise.reject("Firestore not initialized");
    }

    return setDoc(doc(this.firestore, options.reference), options.data as T, {
      merge: options.merge
    });
  }

  public deleteDocument(options: DocumnentReference): Promise<void> {
    if (this.firestore === null) {
      return Promise.reject("Firestore not initialized");
    }

    return deleteDoc(doc(this.firestore, options.reference));
  }

  public addCollectionSnapshotListener<T>(options: CollectionReference, callback: CollectionSnapshotCallback<T>): Promise<CallbackId> {
    if (this.firestore === null) {
      return Promise.reject("Firestore not initialized");
    }

    let collectionQuery: Query;
    if (options.queryConstraints) {
      const constraints = options.queryConstraints.map(constraint => where(constraint.fieldPath, constraint.opStr, constraint.value));
      collectionQuery = query(collection(this.firestore, options.reference), ...constraints);
    } else {
      collectionQuery = query(collection(this.firestore, options.reference));
    }

    const unSubFunc = onSnapshot(collectionQuery, snapshot => {
      callback({
        collection: snapshot.docs.map(doc => {
          return {
            id: doc.id,
            path: doc.ref.path,
            data: doc.data() as T
          };
        })
      });
    });

    const id = new Date().getTime().toString();
    this.subscriptions[id] = unSubFunc;

    return Promise.resolve(id);
  }

  public getCollection<T>(options: CollectionReference): Promise<CollectionSnapshot<T>> {
    if (this.firestore === null) {
      return Promise.reject("Firestore not initialized");
    }

    let collectionQuery: Query;
    if (options.queryConstraints) {
      const constraints = options.queryConstraints.map(constraint => where(constraint.fieldPath, constraint.opStr, constraint.value));
      collectionQuery = query(collection(this.firestore, options.reference), ...constraints);
    } else {
      collectionQuery = query(collection(this.firestore, options.reference));
    }

    return getDocs(collectionQuery).then(snapshot => {
      return {
        collection: snapshot.docs.map(doc => {
          return {
            id: doc.id,
            path: doc.ref.path,
            data: doc.data() as T
          };
        })
      };
    });
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
