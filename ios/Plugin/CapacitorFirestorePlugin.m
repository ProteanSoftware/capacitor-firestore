#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(CapacitorFirestorePlugin, "CapacitorFirestore",
           CAP_PLUGIN_METHOD(initializeFirestore, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(signInWithCustomToken, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(removeSnapshotListener, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getDocument, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getCollection, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(addDocumentSnapshotListener, CAPPluginReturnCallback);
           CAP_PLUGIN_METHOD(addCollectionSnapshotListener, CAPPluginReturnCallback);
)
