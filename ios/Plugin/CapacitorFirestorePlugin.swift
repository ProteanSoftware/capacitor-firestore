import Foundation
import Capacitor
import FirebaseFirestore

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(CapacitorFirestorePlugin)
public class CapacitorFirestorePlugin: CAPPlugin {
    private let implementation = CapacitorFirestore();
    private var listeners: [ String : ListenerRegistration ] = [:];
    
    override public func load() {
        let projectId = getConfigValue("projectId") as? String;
        let applicationId = getConfigValue("applicationId") as? String;
        let apiKey = getConfigValue("apiKey") as? String;
        
        do {
            try implementation.Initialize(projectId: projectId, applicationId: applicationId, apiKey: apiKey);
        } catch {
            print(error);
        }
    }

    @objc func initializeFirestore(_ call: CAPPluginCall) {
        let projectId = call.getString("projectId");
        let applicationId = call.getString("applicationId");
        let apiKey = call.getString("apiKey");
        do {
            try implementation.Initialize(projectId: projectId, applicationId: applicationId, apiKey: apiKey);
            call.resolve();
        } catch CapacitorFirestoreError.runtimeError(let message) {
            call.reject(message);
        } catch {
            call.reject("Unknown error", nil, error, [:]);
        }
    }
    
    @objc func signInWithCustomToken(_ call: CAPPluginCall)  {
        let token = call.getString("token");
        implementation.signInWithCustomToken(token: token) { user, error in
            if (error == nil && user != nil) {
                call.resolve();
            } else {
                call.reject("Sign-in failed", nil, error, [:]);
            }
        }
    }
    
    @objc func removeSnapshotListener(_ call: CAPPluginCall) {
        let callbackId = call.getString("callbackId");
        
        if (callbackId == nil) {
            call.reject("callbackId is null");
            return;
        }

        let listener = listeners[callbackId!];

        if (listener == nil) {
            call.reject("Could not find listener for callback: " + callbackId!);
            return;
        }

        listener?.remove();
        call.resolve();
    }
    
    @objc func addDocumentSnapshotListener(_ call: CAPPluginCall) {
        call.keepAlive = true;
        let callbackId = call.callbackId;
        
        guard let callbackId = callbackId as String? else {
            assert(false, "unable to obtain callbackId from Capacitor");
        }
        
        let documentReference = call.getString("reference");
        let listener = implementation.addDocumentSnapshotListener(documentReference: documentReference) { value, error in
            if (error != nil) {
                call.reject("Document snapshot error", nil, error, [:]);
            } else {
                let result = self.implementation.ConvertSnapshotToJSObject(documentSnapshot: value);
                call.resolve(result);
            }
        }

        listeners[callbackId] = listener;
    }
    
    @objc func getDocument(_ call: CAPPluginCall) {
        let documentReference = call.getString("reference");
        implementation.getDocument(documentReference: documentReference) { value, error in
            if (error != nil) {
                call.reject("Document snapshot error", nil, error, [:]);
            } else {
                let result = self.implementation.ConvertSnapshotToJSObject(documentSnapshot: value);
                call.resolve(result);
            }
        }
    }
    
    @objc func updateDocument(_ call: CAPPluginCall) {
        let documentReference = call.getString("reference");
        let data = call.getObject("data");
        implementation.updateDocument(documentReference: documentReference, data: data) { error in
            if (error != nil) {
                call.reject("Document update error", nil, error, [:]);
            } else {
                call.resolve();
            }
        }
    }
    
    @objc func setDocument(_ call: CAPPluginCall) {
        let documentReference = call.getString("reference");
        let data = call.getObject("data");
        let merge = call.getBool("merge", false);
        implementation.setDocument(documentReference: documentReference, data: data, merge: merge) { error in
            if (error != nil) {
                call.reject("Document set error", nil, error, [:]);
            } else {
                call.resolve();
            }
        }
    }
    
    @objc func deleteDocument(_ call: CAPPluginCall) {
        let documentReference = call.getString("reference");

        implementation.deleteDocument(documentReference: documentReference) { error in
            if (error != nil) {
                call.reject("Document set error", nil, error, [:]);
            } else {
                call.resolve();
            }
        }
    }
    
    @objc func addDocument(_ call: CAPPluginCall) {
        let collectionReference = call.getString("reference");
        let data = call.getObject("data");
        let documentReference = implementation.addDocument(collectionReference: collectionReference, data: data) { error in
            if (error != nil) {
                call.reject("Document update error", nil, error, [:]);
            }
        }
        
        call.resolve([
            "id": documentReference.documentID,
            "path": documentReference.path
        ]);
    }
    
    @objc func addCollectionSnapshotListener(_ call: CAPPluginCall) {
        call.keepAlive = true;
        let callbackId = call.callbackId;
        
        guard let callbackId = callbackId as String? else {
            assert(false, "unable to obtain callbackId from Capacitor");
        }
        
        let collectionReference = call.getString("reference");
        let clientQueryConstraints = call.getArray("queryConstraints", JSObject.self);
        
        do {
            let queryConstaints = try implementation.ConvertJSArrayToQueryConstraints(array: clientQueryConstraints);
            
            let listener = implementation.addCollectionSnapshotListener(collectionReference: collectionReference, queryConstaints: queryConstaints) { value, error in
                if (error != nil) {
                    call.reject("Collection snapshot error", nil, error, [:]);
                } else {
                    let docs = value!.documents;
                    var data: [JSObject] = [];
                    
                    for item in docs {
                        let result = self.implementation.ConvertSnapshotToJSObject(documentSnapshot: item);
                        data.append(result);
                    }
                    
                    call.resolve([
                        "collection": data
                    ]);
                }
            }

            listeners[callbackId] = listener;
        } catch CapacitorFirestoreError.runtimeError(let message) {
            call.reject(message);
        } catch {
            call.reject("Unknown error", nil, error, [:]);
        }
    }
    
    @objc func getCollection(_ call: CAPPluginCall) {
        let collectionReference = call.getString("reference");
        implementation.getCollection(collectionReference: collectionReference) { value, error in
            if (error != nil) {
                call.reject("Collection snapshot error", nil, error, [:]);
            } else {
                let docs = value!.documents;
                var data: [JSObject] = [];
                
                for item in docs {
                    let result = self.implementation.ConvertSnapshotToJSObject(documentSnapshot: item);
                    data.append(result);
                }
                
                call.resolve([
                    "collection": data
                ]);
            }
        }
    }
    
    @objc func enableNetwork(_ call: CAPPluginCall) {
        implementation.enableNetwork() { error in
            if (error != nil) {
                call.reject("Error enabling network", nil, error, [:]);
            } else {
                call.resolve();
            }
        }
    }
    
    @objc func disableNetwork(_ call: CAPPluginCall) {
        implementation.disableNetwork() { error in
            if (error != nil) {
                call.reject("Error disabling netowrk", nil, error, [:]);
            } else {
                call.resolve();
            }
        }
    }
}
