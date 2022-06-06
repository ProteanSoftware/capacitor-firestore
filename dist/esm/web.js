import { WebPlugin } from '@capacitor/core';
export class CapacitorFirestoreWeb extends WebPlugin {
    addDocumentSnapshotListener(options, callback) {
        callback({
            item: 1
        });
        return Promise.resolve(options.reference);
    }
}
//# sourceMappingURL=web.js.map