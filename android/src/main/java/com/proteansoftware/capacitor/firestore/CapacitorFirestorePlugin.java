package com.proteansoftware.capacitor.firestore;

import android.content.Context;

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
        implementation.Initialize(context, projectId);
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
                if (value.exists()) {
                    Map<String, Object> firestoreData = value.getData();
                    JSObject data = new JSObject();

                    for (Map.Entry<String, Object> entry : firestoreData.entrySet()) {
                        data.put(entry.getKey(), entry.getValue());
                    }

                    call.resolve(data);
                } else {
                    call.resolve(null);
                }
            }
        });

        listeners.put(callbackId, listener);
    }
}
