import { registerPlugin } from '@capacitor/core';
import { createQueryConstraint } from './definitions';
const CapacitorFirestore = registerPlugin('CapacitorFirestore', {
    web: () => import('./web').then(m => new m.CapacitorFirestoreWeb()),
});
export * from './definitions';
export { CapacitorFirestore, createQueryConstraint };
//# sourceMappingURL=index.js.map