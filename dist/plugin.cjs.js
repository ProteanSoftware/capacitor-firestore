'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@capacitor/core');

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
    addDocumentSnapshotListener(options, callback) {
        callback({
            id: '1',
            data: {
                item: 1
            }
        });
        return Promise.reject("Not implemented - " + options.reference);
    }
    addCollectionSnapshotListener(options, callback) {
        callback({
            collection: [
                {
                    id: '1',
                    data: {
                        item: 1
                    }
                }
            ]
        });
        return Promise.reject("Not implemented - " + options.reference);
    }
    removeSnapshotListener(options) {
        return Promise.reject("Not implemented - " + options.callbackId);
    }
    signInWithCustomToken(options) {
        console.log(options.token);
        return Promise.reject("Not implemented");
    }
}

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CapacitorFirestoreWeb: CapacitorFirestoreWeb
});

exports.CapacitorFirestore = CapacitorFirestore;
exports.createQueryConstraint = createQueryConstraint;
//# sourceMappingURL=plugin.cjs.js.map
