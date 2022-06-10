'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@capacitor/core');
var firestore = require('firebase/firestore');
var app = require('firebase/app');
var auth = require('firebase/auth');

/* eslint-disable no-prototype-builtins */
/**
 *
 * @param field The path to compare
 * @param operator The operation string (e.g "&lt;", "&lt;=", "==", "&lt;",
 * "&lt;=", "!=", "array-contains")
 * @param value The value for comparison
 * @returns The created {@link QueryConstraint}.
 */
function createQueryConstraint(field, operator, value) {
    return {
        fieldPath: field,
        opStr: operator,
        value: value
    };
}
function prepDataForFirestore(data) {
    for (const prop in data) {
        if (data[prop] instanceof firestore.Timestamp) {
            const timestamp = data[prop];
            data[prop] = {
                specialType: "Timestamp",
                seconds: timestamp.seconds,
                nanoseconds: timestamp.nanoseconds
            };
        }
        if (data[prop] === undefined) {
            delete data[prop];
        }
    }
    return data;
}
function processDocumentData(data) {
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = data[key];
            if (element instanceof Object && element.hasOwnProperty("specialType")) {
                switch (element.specialType) {
                    case "Timestamp":
                        data[key] = new firestore.Timestamp(element.seconds, element.nanoseconds);
                        break;
                    default:
                        throw new Error("Unknown specialType: " + element.specialType);
                }
            }
        }
    }
}

const CapacitorFirestore = core.registerPlugin('CapacitorFirestore', {
    web: () => Promise.resolve().then(function () { return web; }).then(m => new m.CapacitorFirestoreWeb()),
});

class CapacitorFirestoreWeb extends core.WebPlugin {
    constructor() {
        super(...arguments);
        this.app = null;
        this.firestore = null;
        this.subscriptions = {};
    }
    initializeFirestore(options) {
        let teardownPromise = Promise.resolve();
        if (this.firestore !== null) {
            teardownPromise = firestore.terminate(this.firestore);
        }
        teardownPromise = teardownPromise.then(() => {
            if (this.app !== null) {
                app.deleteApp(this.app);
            }
        });
        const initPromise = teardownPromise.then(() => {
            const app$1 = app.initializeApp({
                apiKey: options.apiKey,
                appId: options.applicationId,
                projectId: options.projectId
            }, "CapacitorFirestore");
            this.app = app$1;
            const firestore$1 = firestore.initializeFirestore(app$1, {
                cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED
            });
            return firestore$1;
        });
        return initPromise.then(firestore$1 => {
            firestore.enableIndexedDbPersistence(firestore$1).then(() => {
                this.firestore = firestore$1;
            });
        });
    }
    addDocumentSnapshotListener(options, callback) {
        if (this.firestore === null) {
            return Promise.reject("Firestore not initialized");
        }
        const unSubFunc = firestore.onSnapshot(firestore.doc(this.firestore, options.reference), snapshot => {
            callback({
                id: snapshot.id,
                path: snapshot.ref.path,
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
        return firestore.getDoc(firestore.doc(this.firestore, options.reference)).then(snapshot => {
            return {
                id: snapshot.id,
                path: snapshot.ref.path,
                data: snapshot.exists() ? snapshot.data() : null
            };
        });
    }
    updateDocument(options) {
        if (this.firestore === null) {
            return Promise.reject("Firestore not initialized");
        }
        return firestore.updateDoc(firestore.doc(this.firestore, options.reference), options.data);
    }
    setDocument(options) {
        if (this.firestore === null) {
            return Promise.reject("Firestore not initialized");
        }
        return firestore.setDoc(firestore.doc(this.firestore, options.reference), options.data, {
            merge: options.merge
        });
    }
    deleteDocument(options) {
        if (this.firestore === null) {
            return Promise.reject("Firestore not initialized");
        }
        return firestore.deleteDoc(firestore.doc(this.firestore, options.reference));
    }
    addDocument(options) {
        if (this.firestore === null) {
            return Promise.reject("Firestore not initialized");
        }
        return firestore.addDoc(firestore.collection(this.firestore, options.reference), options.data).then(docRef => {
            return {
                id: docRef.id,
                path: docRef.path
            };
        });
    }
    addCollectionSnapshotListener(options, callback) {
        if (this.firestore === null) {
            return Promise.reject("Firestore not initialized");
        }
        let collectionQuery;
        if (options.queryConstraints) {
            const constraints = options.queryConstraints.map(constraint => firestore.where(constraint.fieldPath, constraint.opStr, constraint.value));
            collectionQuery = firestore.query(firestore.collection(this.firestore, options.reference), ...constraints);
        }
        else {
            collectionQuery = firestore.query(firestore.collection(this.firestore, options.reference));
        }
        const unSubFunc = firestore.onSnapshot(collectionQuery, snapshot => {
            callback({
                collection: snapshot.docs.map(doc => {
                    return {
                        id: doc.id,
                        path: doc.ref.path,
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
            const constraints = options.queryConstraints.map(constraint => firestore.where(constraint.fieldPath, constraint.opStr, constraint.value));
            collectionQuery = firestore.query(firestore.collection(this.firestore, options.reference), ...constraints);
        }
        else {
            collectionQuery = firestore.query(firestore.collection(this.firestore, options.reference));
        }
        return firestore.getDocs(collectionQuery).then(snapshot => {
            return {
                collection: snapshot.docs.map(doc => {
                    return {
                        id: doc.id,
                        path: doc.ref.path,
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
        const auth$1 = auth.getAuth(this.app);
        return auth.signInWithCustomToken(auth$1, options.token).then();
    }
    enableNetwork() {
        if (this.firestore === null) {
            return Promise.reject("Firestore not initialized");
        }
        return firestore.enableNetwork(this.firestore);
    }
    disableNetwork() {
        if (this.firestore === null) {
            return Promise.reject("Firestore not initialized");
        }
        return firestore.disableNetwork(this.firestore);
    }
}

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CapacitorFirestoreWeb: CapacitorFirestoreWeb
});

exports.CapacitorFirestore = CapacitorFirestore;
exports.createQueryConstraint = createQueryConstraint;
exports.prepDataForFirestore = prepDataForFirestore;
exports.processDocumentData = processDocumentData;
//# sourceMappingURL=plugin.cjs.js.map
