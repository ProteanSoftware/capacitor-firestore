package com.proteansoftware.capacitor.firestore;

public class JSQueryConstraints {

    private String fieldPath;
    private String operation;
    private Object value;

    public JSQueryConstraints(String fieldPath, String operation, Object value) {
        this.fieldPath = fieldPath;
        this.operation = operation;
        this.value = value;
    }

    public String getFieldPath() {
        return this.fieldPath;
    }

    public String getOperation() {
        return this.operation;
    }

    public Object getValue() {
        return this.value;
    }
}
