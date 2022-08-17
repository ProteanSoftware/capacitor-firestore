package com.proteansoftware.capacitor.firestore;

import android.content.Context;
import androidx.annotation.NonNull;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.Timestamp;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.EventListener;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreSettings;
import com.google.firebase.firestore.ListenerRegistration;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.firebase.firestore.SetOptions;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.json.JSONException;
import org.json.JSONObject;

public class CapacitorFirestore {

    private FirebaseApp app = null;
    private FirebaseFirestore db = null;

    public void Initialize(Context context, String projectId, String applicationId, String apiKey) throws Exception {
        if (context == null) {
            throw new Exception("Context must not be null");
        }

        if (projectId == null) {
            throw new Exception("ProjectId must not be null");
        }

        if (applicationId == null) {
            throw new Exception("ApplicationId must not be null");
        }

        if (apiKey == null) {
            throw new Exception("apiKey must not be null");
        }

        FirebaseOptions options = new FirebaseOptions.Builder()
            .setApplicationId(applicationId)
            .setApiKey(apiKey)
            .setProjectId(projectId)
            .build();

        if (app != null) {
            app.delete();
        }

        this.app = FirebaseApp.initializeApp(context, options, "CapacitorFirestore");

        this.InitializeFirestore();
    }

    public void signInWithCustomToken(String token, @NonNull OnCompleteListener<AuthResult> completeListener) {
        FirebaseAuth auth = FirebaseAuth.getInstance(this.app);
        auth.signInWithCustomToken(token).addOnCompleteListener(completeListener);
    }

    public ListenerRegistration addDocumentSnapshotListener(String documentReference, @NonNull EventListener<DocumentSnapshot> listener) {
        return this.db.document(documentReference).addSnapshotListener(listener);
    }

    public Task<DocumentSnapshot> getDocument(String documentReference) {
        return this.db.document(documentReference).get();
    }

    public Task<Void> updateDocument(String documentReference, Map<String, Object> data) throws Exception {
        data = this.PrepDataForSend(data);
        return this.db.document(documentReference).update(data);
    }

    public Task<Void> setDocument(String documentReference, Map<String, Object> data, Boolean merge) throws Exception {
        data = this.PrepDataForSend(data);
        if (merge) {
            return this.db.document(documentReference).set(data, SetOptions.merge());
        } else {
            return this.db.document(documentReference).set(data);
        }
    }

    public Task<Void> deleteDocument(String documentReference) {
        return this.db.document(documentReference).delete();
    }

    public Task<Void> addDocument(String collectionReference, String docId, Map<String, Object> data) throws Exception {
        data = this.PrepDataForSend(data);
        return this.db.collection(collectionReference).document(docId).set(data);
    }

    public Task<QuerySnapshot> getCollection(String collectionReference, List<JSQueryConstraints> queryConstraints) throws Exception {
        Query collection = this.db.collection(collectionReference);

        for (JSQueryConstraints queryConstraint : queryConstraints) {
            String operation = queryConstraint.getOperation();

            switch (operation) {
                case "==":
                    collection = collection.whereEqualTo(queryConstraint.getFieldPath(), queryConstraint.getValue());
                    break;
                case ">=":
                    collection = collection.whereGreaterThanOrEqualTo(queryConstraint.getFieldPath(), queryConstraint.getValue());
                    break;
                case "<=":
                    collection = collection.whereLessThanOrEqualTo(queryConstraint.getFieldPath(), queryConstraint.getValue());
                    break;
                case ">":
                    collection = collection.whereGreaterThan(queryConstraint.getFieldPath(), queryConstraint.getValue());
                    break;
                case "<":
                    collection = collection.whereLessThan(queryConstraint.getFieldPath(), queryConstraint.getValue());
                    break;
                case "array-contains":
                    collection = collection.whereArrayContains(queryConstraint.getFieldPath(), queryConstraint.getValue());
                    break;
                default:
                    throw new Exception("query operation not support: " + operation);
            }
        }

        return collection.get();
    }

    public ListenerRegistration addCollectionSnapshotListener(
        String collectionReference,
        List<JSQueryConstraints> queryConstraints,
        @NonNull EventListener<QuerySnapshot> listener
    ) throws Exception {
        Query collection = this.db.collection(collectionReference);

        for (JSQueryConstraints queryConstraint : queryConstraints) {
            String operation = queryConstraint.getOperation();

            switch (operation) {
                case "==":
                    collection = collection.whereEqualTo(queryConstraint.getFieldPath(), queryConstraint.getValue());
                    break;
                case ">=":
                    collection = collection.whereGreaterThanOrEqualTo(queryConstraint.getFieldPath(), queryConstraint.getValue());
                    break;
                case "<=":
                    collection = collection.whereLessThanOrEqualTo(queryConstraint.getFieldPath(), queryConstraint.getValue());
                    break;
                case ">":
                    collection = collection.whereGreaterThan(queryConstraint.getFieldPath(), queryConstraint.getValue());
                    break;
                case "<":
                    collection = collection.whereLessThan(queryConstraint.getFieldPath(), queryConstraint.getValue());
                    break;
                case "array-contains":
                    collection = collection.whereArrayContains(queryConstraint.getFieldPath(), queryConstraint.getValue());
                    break;
                default:
                    throw new Exception("query operation not support: " + operation);
            }
        }

        return collection.addSnapshotListener(listener);
    }

    public JSObject ConvertSnapshotToJSObject(DocumentSnapshot documentSnapshot) {
        JSObject result = new JSObject();
        result.put("id", documentSnapshot.getId());
        result.put("path", documentSnapshot.getReference().getPath());
        if (documentSnapshot.exists()) {
            Map<String, Object> firestoreData = documentSnapshot.getData();
            JSObject data = new JSObject();

            for (Map.Entry<String, Object> entry : firestoreData.entrySet()) {
                Object value = entry.getValue();
                value = ConvertObjectRead(value);

                data.put(entry.getKey(), value);
            }

            result.put("data", data);
        }

        return result;
    }

    public List<JSQueryConstraints> ConvertJSArrayToQueryConstraints(JSArray array) throws Exception {
        if (array == null) {
            return null;
        }

        ArrayList<JSQueryConstraints> list = new ArrayList<>();
        for (int x = 0; x < array.length(); x++) {
            JSONObject item = array.getJSONObject(x);
            String fieldPath = item.getString("fieldPath");
            String operation = item.getString("opStr");
            Object value = item.get("value");

            if (value instanceof JSONObject) {
                JSONObject jsonObject = ((JSONObject) value);
                if (jsonObject.has("seconds") && jsonObject.has("nanoseconds")) {
                    value = new Timestamp(jsonObject.getLong("seconds"), jsonObject.getInt("nanoseconds"));
                } else {
                    throw new Exception("unhandled JSONObject type: " + jsonObject);
                }
            }
            list.add(new JSQueryConstraints(fieldPath, operation, value));
        }

        return list;
    }

    private Map<String, Object> PrepDataForSend(Map<String, Object> data) throws Exception {
        Map<String, Object> prepared = new HashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            Object value = entry.getValue();
            prepared.put(entry.getKey(), ConvertObjectWrite(value));
        }

        return prepared;
    }

    private Object ConvertObjectWrite(Object value) throws Exception {
        if (value != null && value.toString().equals("null")) {
            value = null;
        } else if (value instanceof JSONObject) {
            JSONObject jsObject = ((JSONObject) value);

            if (jsObject.has("specialType")) {
                String specialType = jsObject.getString("specialType");
                switch (specialType) {
                    case "Timestamp":
                        value = new Timestamp(jsObject.getLong("seconds"), jsObject.getInt("nanoseconds"));
                        break;
                    default:
                        throw new Exception("Unhandled specialType:" + specialType);
                }
            }
        } else if (value instanceof HashMap) {
            HashMap<String, Object> jsObject = ((HashMap<String, Object>) value);

            if (jsObject.keySet().contains("specialType")) {
                String specialType = (String) jsObject.get("specialType");
                switch (specialType) {
                    case "Timestamp":
                        value = new Timestamp(Long.parseLong(jsObject.get("seconds").toString()), (int) jsObject.get("nanoseconds"));
                        break;
                    default:
                        throw new Exception("Unhandled specialType:" + specialType);
                }
            }
        }

        return value;
    }

    private Object ConvertObjectRead(Object value) {
        if (value instanceof ArrayList) {
            ArrayList list = (ArrayList) value;

            JSArray array = new JSArray();
            for (Object item : list) {
                if (item instanceof HashMap) {
                    HashMap<String, Object> prop = (HashMap<String, Object>) item;

                    JSObject map = new JSObject();
                    for (Map.Entry<String, Object> i : prop.entrySet()) {
                        map.put(i.getKey(), ConvertObjectRead(i.getValue()));
                    }
                    array.put(map);
                } else {
                    array.put(item);
                }
            }
            value = array;
        } else if (value instanceof HashMap) {
            HashMap<String, Object> list = (HashMap<String, Object>) value;

            JSObject map = new JSObject();
            for (Map.Entry<String, Object> i : list.entrySet()) {
                map.put(i.getKey(), ConvertObjectRead(i.getValue()));
            }

            value = map;
        } else if (value instanceof Timestamp) {
            JSONObject jsonObject = new JSObject();
            try {
                jsonObject.put("seconds", ((Timestamp) value).getSeconds());
                jsonObject.put("nanoseconds", ((Timestamp) value).getNanoseconds());
                jsonObject.put("specialType", "Timestamp");
            } catch (JSONException e) {
                e.printStackTrace();
            }
            value = jsonObject;
        }

        return value;
    }

    private void InitializeFirestore() throws Exception {
        if (this.app == null) {
            throw new Exception("app must be initialized first");
        }
        if (this.db != null) {
            this.db.terminate();
        }

        this.db = FirebaseFirestore.getInstance(app);

        FirebaseFirestoreSettings settings = new FirebaseFirestoreSettings.Builder()
            .setPersistenceEnabled(true)
            .setCacheSizeBytes(FirebaseFirestoreSettings.CACHE_SIZE_UNLIMITED)
            .build();

        this.db.setFirestoreSettings(settings);
    }

    public Task<Void> enableNetwork() {
        return this.db.enableNetwork();
    }

    public Task<Void> disableNetwork() {
        return this.db.enableNetwork();
    }
}
