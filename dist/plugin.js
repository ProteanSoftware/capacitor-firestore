var capacitorCapacitorFirestore = (function (exports, core) {
    'use strict';

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

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, capacitorExports);
//# sourceMappingURL=plugin.js.map
