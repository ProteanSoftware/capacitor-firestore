import { registerPlugin } from "@capacitor/core";

import {
  createQueryConstraint,
  prepDataForFirestore,
  processDocumentData,
} from "./definitions";
import type { CapacitorFirestorePlugin } from "./definitions";

const CapacitorFirestore = registerPlugin<CapacitorFirestorePlugin>(
  "CapacitorFirestore",
  {
    web: () => import("./web").then(m => new m.CapacitorFirestoreWeb()),
  },
);

export * from "./definitions";
export {
  CapacitorFirestore,
  createQueryConstraint,
  prepDataForFirestore,
  processDocumentData,
};
