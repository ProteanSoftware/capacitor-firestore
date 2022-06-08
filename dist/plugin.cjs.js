'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@capacitor/core');
var app = require('firebase/app');
var auth = require('firebase/auth');
var firestore = require('firebase/firestore');

/// <reference types="@capacitor/cli" />
function createQueryConstraint(field, operator, value) {
    return {
        fieldPath: field,
        opStr: operator,
        value: value
    };
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
                data: snapshot.exists() ? snapshot.data() : null
            });
        });
        const id = new Date().getTime().toString();
        this.subscriptions[id] = unSubFunc;
        return Promise.resolve(id);
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
                        data: doc.data()
                    };
                })
            });
        });
        const id = new Date().getTime().toString();
        this.subscriptions[id] = unSubFunc;
        return Promise.resolve(id);
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
}

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CapacitorFirestoreWeb: CapacitorFirestoreWeb
});

exports.CapacitorFirestore = CapacitorFirestore;
exports.createQueryConstraint = createQueryConstraint;
//# sourceMappingURL=plugin.cjs.js.map
