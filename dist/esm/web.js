import { WebPlugin } from '@capacitor/core';
export class CapacitorFirestoreWeb extends WebPlugin {
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
//# sourceMappingURL=web.js.map