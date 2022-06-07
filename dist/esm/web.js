import { WebPlugin } from '@capacitor/core';
export class CapacitorFirestoreWeb extends WebPlugin {
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
//# sourceMappingURL=web.js.map