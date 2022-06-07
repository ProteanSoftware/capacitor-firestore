package com.proteansoftware.capacitor.firestore;

import android.content.Context;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.firebase.firestore.ListenerRegistration;

import java.util.HashMap;
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
        implementation.Initialize(context, projectId, applicationId, apiKey);
    }

    @PluginMethod()
    public void signInWithCustomToken(PluginCall call) {
        String token = call.getString("token");
        implementation.signInWithCustomToken(token, (result) -> {
            if (result.isSuccessful()) {
                call.resolve();
            } else {
                call.reject("Sign-in failed", result.getException());
            }
        });
    }

    @PluginMethod()
    public void removeSnapshotListener(PluginCall call) {
        String callbackId = call.getString("callbackId");
        ListenerRegistration listener = listeners.get(callbackId);
        listener.remove();
        call.resolve();
    }

    @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
    public void addDocumentSnapshotListener(PluginCall call) {
        call.setKeepAlive(true);
        String callbackId = call.getCallbackId();
        String documentReference = call.getString("reference");
        ListenerRegistration listener = implementation.addDocumentSnapshotListener(documentReference, (value, error) -> {
            if (error != null) {
                call.reject(error.getMessage(), error);
            } else {
                JSObject result = new JSObject();
                result.put("id", value.getId());
                if (value.exists()) {
                    Map<String, Object> firestoreData = value.getData();
                    JSObject data = new JSObject();

                    for (Map.Entry<String, Object> entry : firestoreData.entrySet()) {
                        data.put(entry.getKey(), entry.getValue());
                    }

                    result.put("data", data);
                }

                call.resolve(result);
            }
        });

        listeners.put(callbackId, listener);
    }
}
