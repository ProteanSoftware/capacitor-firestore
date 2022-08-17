package com.proteansoftware.capacitor.firestore;

import android.annotation.SuppressLint;
import android.content.Context;
import android.util.Log;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.tasks.Task;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.ListenerRegistration;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.firebase.firestore.util.Util;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin(name = "CapacitorFirestore")
public class CapacitorFirestorePlugin extends Plugin {

    private CapacitorFirestore implementation = new CapacitorFirestore();
    private Map<String, ListenerRegistration> listeners = new HashMap<>();
    private int pendingActions = 0;

    @Override
    public void load() {
        Context context = this.getContext();
        String projectId = getConfig().getString("projectId");
        String applicationId = getConfig().getString("applicationId");
        String apiKey = getConfig().getString("apiKey");

        try {
            implementation.Initialize(context, projectId, applicationId, apiKey);
        } catch (Exception e) {
            Log.e("CapacitorFirestore", e.getMessage());
        }
    }

    @PluginMethod
    public void getPendingActions(PluginCall call) {
        JSObject object = new JSObject();
        object.put("count", pendingActions);
        call.resolve(object);
    }

    @PluginMethod
    public void initializeFirestore(PluginCall call) {
        String projectId = call.getString("projectId");
        String applicationId = call.getString("applicationId");
        String apiKey = call.getString("apiKey");
        try {
            implementation.Initialize(this.getContext(), projectId, applicationId, apiKey);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void signInWithCustomToken(PluginCall call) {
        String token = call.getString("token");
        implementation.signInWithCustomToken(
            token,
            result -> {
                if (result.isSuccessful()) {
                    call.resolve();
                } else {
                    call.reject("Sign-in failed", result.getException());
                }
            }
        );
    }

    @PluginMethod
    public void removeSnapshotListener(PluginCall call) {
        String callbackId = call.getString("callbackId");

        if (callbackId == null) {
            call.reject("callbackId is null");
            return;
        }

        ListenerRegistration listener = listeners.get(callbackId);

        if (listener == null) {
            call.reject("Could not find listener for callback: " + callbackId);
            return;
        }

        listener.remove();
        call.resolve();
    }

    @PluginMethod
    public void getDocument(PluginCall call) {
        String documentReference = call.getString("reference");
        Task<DocumentSnapshot> listener = implementation.getDocument(documentReference);

        listener.addOnSuccessListener(
            value -> {
                JSObject result = implementation.ConvertSnapshotToJSObject(value);
                call.resolve(result);
            }
        );

        listener.addOnFailureListener(
            error -> {
                call.reject(error.getMessage(), error);
            }
        );
    }

    @PluginMethod
    public void updateDocument(PluginCall call) {
        String documentReference = call.getString("reference");
        JSObject data = call.getObject("data");

        HashMap<String, Object> mapData;

        try {
            mapData = mapJSObject(data);
        } catch (JSONException e) {
            call.reject(e.getMessage(), e);
            return;
        }

        Task<Void> listener = null;
        try {
            pendingActions++;
            listener = implementation.updateDocument(documentReference, mapData);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage(), e);
        }

        if (listener != null) {
            listener.addOnSuccessListener(
                value -> {
                    pendingActions--;
                }
            );

            listener.addOnFailureListener(
                error -> {
                    pendingActions--;
                    call.reject(error.getMessage(), error);
                }
            );
        }
    }

    @PluginMethod
    public void setDocument(PluginCall call) {
        String documentReference = call.getString("reference");
        JSObject data = call.getObject("data");
        Boolean merge = call.getBoolean("merge", false);

        HashMap<String, Object> mapData;

        try {
            mapData = mapJSObject(data);
        } catch (JSONException e) {
            call.reject(e.getMessage(), e);
            return;
        }

        Task<Void> listener = null;
        try {
            pendingActions++;
            listener = implementation.setDocument(documentReference, mapData, merge);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage(), e);
        }

        if (listener != null) {
            listener.addOnSuccessListener(
                value -> {
                    pendingActions--;
                }
            );

            listener.addOnFailureListener(
                error -> {
                    pendingActions--;
                    call.reject(error.getMessage(), error);
                }
            );
        }
    }

    @PluginMethod
    public void deleteDocument(PluginCall call) {
        String documentReference = call.getString("reference");

        pendingActions++;
        Task<Void> listener = implementation.deleteDocument(documentReference);
        call.resolve();

        listener.addOnSuccessListener(
            value -> {
                pendingActions--;
            }
        );

        listener.addOnFailureListener(
            error -> {
                pendingActions--;
                call.reject(error.getMessage(), error);
            }
        );
    }

    @PluginMethod
    public void addDocument(PluginCall call) {
        String collectionReference = call.getString("reference");
        JSObject data = call.getObject("data");

        HashMap<String, Object> mapData;

        try {
            mapData = mapJSObject(data);
        } catch (JSONException e) {
            call.reject(e.getMessage(), e);
            return;
        }

        Task<Void> listener = null;
        try {
            pendingActions++;
            @SuppressLint("RestrictedApi")
            String docId = Util.autoId();
            listener = implementation.addDocument(collectionReference, docId, mapData);
            JSObject result = new JSObject();
            result.put("id", docId);
            result.put("path", collectionReference + "/" + docId);
            pendingActions--;
            call.resolve(result);
        } catch (Exception e) {
            call.reject(e.getMessage(), e);
        }

        if (listener != null) {
            listener.addOnSuccessListener(
                value -> {
                    pendingActions--;
                }
            );

            listener.addOnFailureListener(
                error -> {
                    pendingActions--;
                    call.reject(error.getMessage(), error);
                }
            );
        }
    }

    @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
    public void addDocumentSnapshotListener(PluginCall call) {
        call.setKeepAlive(true);
        String callbackId = call.getCallbackId();
        String documentReference = call.getString("reference");
        ListenerRegistration listener = implementation.addDocumentSnapshotListener(
            documentReference,
            (value, error) -> {
                if (error != null) {
                    call.reject(error.getMessage(), error);
                } else {
                    JSObject result = implementation.ConvertSnapshotToJSObject(value);
                    call.resolve(result);
                }
            }
        );

        listeners.put(callbackId, listener);
    }

    @PluginMethod
    public void getCollection(PluginCall call) {
        String documentReference = call.getString("reference");
        JSArray clientQueryConstraints = call.getArray("queryConstraints");
        Task<QuerySnapshot> listener;

        try {
            List<JSQueryConstraints> queryConstraints = implementation.ConvertJSArrayToQueryConstraints(clientQueryConstraints);
            listener = implementation.getCollection(documentReference, queryConstraints);

            listener.addOnSuccessListener(
                value -> {
                    JSObject result = new JSObject();
                    JSArray items = new JSArray();

                    List<DocumentSnapshot> documents = value.getDocuments();
                    for (DocumentSnapshot documentSnapshot : documents) {
                        JSObject item = implementation.ConvertSnapshotToJSObject(documentSnapshot);
                        items.put(item);
                    }

                    result.put("collection", items);
                    call.resolve(result);
                }
            );

            listener.addOnFailureListener(
                error -> {
                    call.reject(error.getMessage(), error);
                }
            );
        } catch (Exception e) {
            e.printStackTrace();
            call.reject(e.getMessage(), e);
        }
    }

    @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
    public void addCollectionSnapshotListener(PluginCall call) {
        call.setKeepAlive(true);
        String callbackId = call.getCallbackId();
        String collectionReference = call.getString("reference");
        JSArray clientQueryConstraints = call.getArray("queryConstraints");
        ListenerRegistration listener = null;
        try {
            List<JSQueryConstraints> queryConstraints = implementation.ConvertJSArrayToQueryConstraints(clientQueryConstraints);
            listener =
                implementation.addCollectionSnapshotListener(
                    collectionReference,
                    queryConstraints,
                    (value, error) -> {
                        if (error != null) {
                            call.reject(error.getMessage(), error);
                        } else {
                            JSObject result = new JSObject();
                            JSArray items = new JSArray();

                            List<DocumentSnapshot> documents = value.getDocuments();
                            for (DocumentSnapshot documentSnapshot : documents) {
                                JSObject item = implementation.ConvertSnapshotToJSObject(documentSnapshot);
                                items.put(item);
                            }

                            result.put("collection", items);
                            call.resolve(result);
                        }
                    }
                );
        } catch (Exception e) {
            e.printStackTrace();
            call.reject(e.getMessage(), e);
        }

        listeners.put(callbackId, listener);
    }

    @PluginMethod
    public void enableNetwork(PluginCall call) {
        Task<Void> listener = implementation.enableNetwork();

        listener.addOnSuccessListener(
            value -> {
                call.resolve();
            }
        );

        listener.addOnFailureListener(
            error -> {
                call.reject(error.getMessage(), error);
            }
        );
    }

    @PluginMethod
    public void disableNetwork(PluginCall call) {
        Task<Void> listener = implementation.disableNetwork();

        listener.addOnSuccessListener(
            value -> {
                call.resolve();
            }
        );

        listener.addOnFailureListener(
            error -> {
                call.reject(error.getMessage(), error);
            }
        );
    }

    private HashMap<String, Object> mapJSObject(JSONObject jsObject) throws JSONException {
        HashMap<String, Object> mapData = new HashMap<>();
        Iterator<String> keys = jsObject.keys();

        while (keys.hasNext()) {
            String key = keys.next();
            Object value = jsObject.get(key);

            if (value.toString().equals("null")) {
                value = null;
            } else if (value instanceof JSONObject) {
                value = mapJSObject((JSONObject) value);
            } else if (value instanceof JSONArray) {
                value = mapJSArray((JSONArray) value);
            }

            mapData.put(key, value);
        }

        return mapData;
    }

    private ArrayList<Object> mapJSArray(JSONArray array) throws JSONException {
        ArrayList<Object> arrayList = new ArrayList<>();
        for (int x = 0; x < array.length(); x++) {
            Object value = array.get(x);

            if (value instanceof JSONObject) {
                value = mapJSObject((JSONObject) value);
            } else if (value instanceof JSONArray) {
                value = mapJSArray((JSONArray) value);
            }

            arrayList.add(value);
        }

        return arrayList;
    }
}
