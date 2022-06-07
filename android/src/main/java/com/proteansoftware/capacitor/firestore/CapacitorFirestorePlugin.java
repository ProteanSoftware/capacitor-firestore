package com.proteansoftware.capacitor.firestore;

import android.content.Context;
import android.util.Log;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.ListenerRegistration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CapacitorPlugin(name = "CapacitorFirestore")
public class CapacitorFirestorePlugin extends Plugin {

    private CapacitorFirestore implementation = new CapacitorFirestore();
    private Map<String, ListenerRegistration> listeners = new HashMap<>();

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
}
