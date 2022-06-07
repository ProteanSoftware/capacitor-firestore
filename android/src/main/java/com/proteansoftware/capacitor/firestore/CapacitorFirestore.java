package com.proteansoftware.capacitor.firestore;

import android.content.Context;

import androidx.annotation.NonNull;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.EventListener;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreSettings;
import com.google.firebase.firestore.ListenerRegistration;

public class CapacitorFirestore {

    private FirebaseApp app;
    private FirebaseFirestore db;

    public void Initialize(Context context, String projectId, String applicationId, String apiKey) {
        FirebaseOptions options = new FirebaseOptions.Builder()
                .setApplicationId(applicationId)
                .setApiKey(apiKey)
                .setProjectId(projectId)
                .build();

        this.app = FirebaseApp.initializeApp(context, options, "CapacitorFirestore");

        this.InitializeFirestore();
    }

    public void signInWithCustomToken(String token, @NonNull OnCompleteListener<AuthResult> completeListener)
    {
        FirebaseAuth auth = FirebaseAuth.getInstance(this.app);
        auth.signInWithCustomToken(token).addOnCompleteListener(completeListener);
    }

    public ListenerRegistration addDocumentSnapshotListener(String documentReference, @NonNull EventListener<DocumentSnapshot> listener) {
        return this.db.document(documentReference).addSnapshotListener(listener);
    }

    private void InitializeFirestore() {
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
}
