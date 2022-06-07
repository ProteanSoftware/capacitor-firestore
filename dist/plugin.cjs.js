'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@capacitor/core');

const CapacitorFirestore = core.registerPlugin('CapacitorFirestore', {
    web: () => Promise.resolve().then(function () { return web; }).then(m => new m.CapacitorFirestoreWeb()),
});

class CapacitorFirestoreWeb extends core.WebPlugin {
    addDocumentSnapshotListener(options, callback) {
        callback({
            item: 1
        });
        return Promise.resolve(options.reference);
    }
    signInWithCustomToken(options) {
        console.log(options.token);
        return Promise.resolve();
    }
}

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CapacitorFirestoreWeb: CapacitorFirestoreWeb
});

exports.CapacitorFirestore = CapacitorFirestore;
//# sourceMappingURL=plugin.cjs.js.map
