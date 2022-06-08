import { WebPlugin } from '@capacitor/core';
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { initializeFirestore, terminate, enableIndexedDbPersistence, onSnapshot, doc, getDoc, getDocs, updateDoc, collection, query, where, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
export class CapacitorFirestoreWeb extends WebPlugin {
    constructor() {
        super(...arguments);
        this.app = null;
        this.firestore = null;
        this.subscriptions = {};
    }
    initializeFirestore(options) {
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
    addDocumentSnapshotListener(options, callback) {
        if (this.firestore === null) {
            return Promise.reject("Firestore not initialized");
        }
        const unSubFunc = onSnapshot(doc(this.firestore, options.reference), snapshot => {
            callback({
                id: snapshot.id,
                data: snapshot.exists() ? snapshot.data() : null
            });
        });
        const id = new Date().getTime().toString();
        this.subscriptions[id] = unSubFunc;
        return Promise.resolve(id);
    }
    getDocument(options) {
        if (this.firestore === null) {
            return Promise.reject("Firestore not initialized");
        }
        return getDoc(doc(this.firestore, options.reference)).then(snapshot => {
            return {
                id: snapshot.id,
                data: snapshot.exists() ? snapshot.data() : null
            };
        });
    }
    updateDocument(options) {
        if (this.firestore === null) {
            return Promise.reject("Firestore not initialized");
        }
        return updateDoc(doc(this.firestore, options.reference), options.data);
    }
    addCollectionSnapshotListener(options, callback) {
        if (this.firestore === null) {
            return Promise.reject("Firestore not initialized");
        }
        let collectionQuery;
        if (options.queryConstraints) {
            const constraints = options.queryConstraints.map(constraint => where(constraint.fieldPath, constraint.opStr, constraint.value));
            collectionQuery = query(collection(this.firestore, options.reference), ...constraints);
        }
        else {
            collectionQuery = query(collection(this.firestore, options.reference));
        }
        const unSubFunc = onSnapshot(collectionQuery, snapshot => {
            callback({
                collection: snapshot.docs.map(doc => {
                    return {
                        id: doc.id,
                        data: doc.data()
                    };
                })
            });
        });
        const id = new Date().getTime().toString();
        this.subscriptions[id] = unSubFunc;
        return Promise.resolve(id);
    }
    getCollection(options) {
        if (this.firestore === null) {
            return Promise.reject("Firestore not initialized");
        }
        let collectionQuery;
        if (options.queryConstraints) {
            const constraints = options.queryConstraints.map(constraint => where(constraint.fieldPath, constraint.opStr, constraint.value));
            collectionQuery = query(collection(this.firestore, options.reference), ...constraints);
        }
        else {
            collectionQuery = query(collection(this.firestore, options.reference));
        }
        return getDocs(collectionQuery).then(snapshot => {
            return {
                collection: snapshot.docs.map(doc => {
                    return {
                        id: doc.id,
                        data: doc.data()
                    };
                })
            };
        });
    }
    removeSnapshotListener(options) {
        const unSubFunc = this.subscriptions[options.callbackId];
        if (unSubFunc === undefined) {
            return Promise.reject("No callback with id " + options.callbackId);
        }
        unSubFunc();
        delete this.subscriptions[options.callbackId];
        return Promise.resolve();
    }
    signInWithCustomToken(options) {
        if (this.app === null) {
            return Promise.reject("app not initialized");
        }
        const auth = getAuth(this.app);
        return signInWithCustomToken(auth, options.token).then();
    }
}
//# sourceMappingURL=web.js.map