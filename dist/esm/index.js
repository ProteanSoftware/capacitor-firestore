import { registerPlugin } from '@capacitor/core';
import { createQueryConstraint, prepDataForFirestore, processDocumentData } from './definitions';
const CapacitorFirestore = registerPlugin('CapacitorFirestore', {
    web: () => import('./web').then(m => new m.CapacitorFirestoreWeb()),
});
export * from './definitions';
export { CapacitorFirestore, createQueryConstraint, prepDataForFirestore, processDocumentData };
//# sourceMappingURL=index.js.map