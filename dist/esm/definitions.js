/* eslint-disable no-prototype-builtins */
/// <reference types="@capacitor/cli" />
import { Timestamp } from "firebase/firestore";
/**
 *
 * @param field The path to compare
 * @param operator The operation string (e.g "&lt;", "&lt;=", "==", "&lt;",
 * "&lt;=", "!=", "array-contains")
 * @param value The value for comparison
 * @returns The created {@link QueryConstraint}.
 */
export function createQueryConstraint(field, operator, value) {
    return {
        fieldPath: field,
        opStr: operator,
        value: value
    };
}
export function prepDataForFirestore(data) {
    for (const prop in data) {
        if (data[prop] instanceof Timestamp) {
            const timestamp = data[prop];
            data[prop] = {
                specialType: "Timestamp",
                seconds: timestamp.seconds,
                nanoseconds: timestamp.nanoseconds
            };
        }
        if (data[prop] === undefined) {
            delete data[prop];
        }
    }
    return data;
}
export function processDocumentData(data) {
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = data[key];
            if (element instanceof Object && element.hasOwnProperty("specialType")) {
                switch (element.specialType) {
                    case "Timestamp":
                        data[key] = new Timestamp(element.seconds, element.nanoseconds);
                        break;
                    default:
                        throw new Error("Unknown specialType: " + element.specialType);
                }
            }
        }
    }
}
//# sourceMappingURL=definitions.js.map