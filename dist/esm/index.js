import { registerPlugin } from '@capacitor/core';
const CapacitorFirestore = registerPlugin('CapacitorFirestore', {
    web: () => import('./web').then(m => new m.CapacitorFirestoreWeb()),
});
export * from './definitions';
export { CapacitorFirestore };
//# sourceMappingURL=index.js.map