package com.proteansoftware.capacitor.firestore;

import android.content.Context;

import androidx.annotation.NonNull;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.EventListener;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreSettings;
import com.google.firebase.firestore.ListenerRegistration;

public class CapacitorFirestore {
    private FirebaseFirestore db;

    public void Initialize(Context context, String projectId) {
        FirebaseOptions options = new FirebaseOptions.Builder()
                .setProjectId(projectId)
                .build();

        FirebaseApp app = FirebaseApp.initializeApp(context, options);
        this.db = FirebaseFirestore.getInstance(app);

        FirebaseFirestoreSettings settings = new FirebaseFirestoreSettings.Builder()
                .setPersistenceEnabled(true)
                .setCacheSizeBytes(FirebaseFirestoreSettings.CACHE_SIZE_UNLIMITED)
                .build();

        this.db.setFirestoreSettings(settings);
    }

    public ListenerRegistration addDocumentSnapshotListener(String documentReference, @NonNull EventListener<DocumentSnapshot> listener) {
        return this.db.document(documentReference).addSnapshotListener(listener);
    }
}
