/// <reference types="@capacitor/cli" />
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
//# sourceMappingURL=definitions.js.map