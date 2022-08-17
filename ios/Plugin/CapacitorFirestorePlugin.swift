import Foundation
import Capacitor
import FirebaseFirestore

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(CapacitorFirestorePlugin)
public class CapacitorFirestorePlugin: CAPPlugin {
    private let implementation = CapacitorFirestore()
    private var listeners: [ String: ListenerRegistration ] = [:]
    private var pendingActions: Int = 0

    override public func load() {
        let projectId = getConfigValue("projectId") as? String
        let applicationId = getConfigValue("applicationId") as? String
        let apiKey = getConfigValue("apiKey") as? String

        if projectId != nil && applicationId != nil && apiKey != nil {
            do {
                try implementation.Initialize(projectId: projectId, applicationId: applicationId, apiKey: apiKey)
            } catch {
                print(error)
            }
        }
    }

    @objc func  getPendingActions(_ call: CAPPluginCall) {
        call.resolve([
            "count": pendingActions
        ])
    }

    @objc func initializeFirestore(_ call: CAPPluginCall) {
        let projectId = call.getString("projectId")
        let applicationId = call.getString("applicationId")
        let apiKey = call.getString("apiKey")
        do {
            try implementation.Initialize(projectId: projectId, applicationId: applicationId, apiKey: apiKey)
            call.resolve()
        } catch CapacitorFirestoreError.runtimeError(let message) {
            call.reject(message)
        } catch {
            call.reject("Unknown error", nil, error, [:])
        }
    }

    @objc func signInWithCustomToken(_ call: CAPPluginCall) {
        let token = call.getString("token")
        do {
            try implementation.signInWithCustomToken(token: token) { user, error in
                if error == nil && user != nil {
                    call.resolve()
                } else {
                    call.reject("Sign-in failed", nil, error, [:])
                }
            }
        } catch CapacitorFirestoreError.runtimeError(let message) {
            call.reject(message)
        } catch {
            call.reject("Unknown error", nil, error, [:])
        }
    }

    @objc func removeSnapshotListener(_ call: CAPPluginCall) {
        let callbackId = call.getString("callbackId")

        if callbackId == nil {
            call.reject("callbackId is null")
            return
        }

        let listener = listeners[callbackId!]

        if listener == nil {
            call.reject("Could not find listener for callback: " + callbackId!)
            return
        }

        listener?.remove()
        call.resolve()
    }

    @objc func addDocumentSnapshotListener(_ call: CAPPluginCall) {
        call.keepAlive = true
        let callbackId = call.callbackId

        guard let callbackId = callbackId as String? else {
            call.reject("unable to obtain callbackId from Capacitor")
            return
        }

        let documentReference = call.getString("reference")
        do {
            let listener = try implementation.addDocumentSnapshotListener(documentReference: documentReference) { value, error in
                if error != nil {
                    call.reject("Document snapshot error", nil, error, [:])
                } else {
                    do {
                        let result = try self.implementation.ConvertSnapshotToJSObject(documentSnapshot: value)
                        call.resolve(result)
                    } catch CapacitorFirestoreError.runtimeError(let message) {
                        call.reject(message)
                    } catch {
                        call.reject("Unknown error", nil, error, [:])
                    }
                }
            }

            listeners[callbackId] = listener
        } catch CapacitorFirestoreError.runtimeError(let message) {
            call.reject(message)
        } catch {
            call.reject("Unknown error", nil, error, [:])
        }

    }

    @objc func getDocument(_ call: CAPPluginCall) {
        let documentReference = call.getString("reference")

        do {
            try implementation.getDocument(documentReference: documentReference) { value, error in
                if error != nil {
                    call.reject("Document snapshot error", nil, error, [:])
                } else {
                    do {
                        let result = try self.implementation.ConvertSnapshotToJSObject(documentSnapshot: value)
                        call.resolve(result)
                    } catch CapacitorFirestoreError.runtimeError(let message) {
                        call.reject(message)
                    } catch {
                        call.reject("Unknown error", nil, error, [:])
                    }
                }
            }
        } catch CapacitorFirestoreError.runtimeError(let message) {
            call.reject(message)
        } catch {
            call.reject("Unknown error", nil, error, [:])
        }
    }

    @objc func updateDocument(_ call: CAPPluginCall) {
        let documentReference = call.getString("reference")
        let data = call.getObject("data")

        do {
            self.pendingActions += 1
            try implementation.updateDocument(documentReference: documentReference, data: data) { error in
                self.pendingActions -= 1
                if error != nil {
                    call.reject("Document update error", nil, error, [:])
                }
            }
            call.resolve()
        } catch CapacitorFirestoreError.runtimeError(let message) {
            call.reject(message)
        } catch {
            call.reject("Unknown error", nil, error, [:])
        }
    }

    @objc func setDocument(_ call: CAPPluginCall) {
        let documentReference = call.getString("reference")
        let data = call.getObject("data")
        let merge = call.getBool("merge", false)

        do {
            self.pendingActions += 1
            try implementation.setDocument(documentReference: documentReference, data: data, merge: merge) { error in
                self.pendingActions -= 1
                if error != nil {
                    call.reject("Document set error", nil, error, [:])
                }
            }
            call.resolve()
        } catch CapacitorFirestoreError.runtimeError(let message) {
            call.reject(message)
        } catch {
            call.reject("Unknown error", nil, error, [:])
        }
    }

    @objc func deleteDocument(_ call: CAPPluginCall) {
        let documentReference = call.getString("reference")

        do {
            self.pendingActions += 1
            try implementation.deleteDocument(documentReference: documentReference) { error in
                self.pendingActions -= 1
                if error != nil {
                    call.reject("Document set error", nil, error, [:])
                }
            }
            call.resolve()
        } catch CapacitorFirestoreError.runtimeError(let message) {
            call.reject(message)
        } catch {
            call.reject("Unknown error", nil, error, [:])
        }
    }

    @objc func addDocument(_ call: CAPPluginCall) {
        let collectionReference = call.getString("reference")
        let data = call.getObject("data")

        do {
            var documentReference: DocumentReference?
            self.pendingActions += 1
            documentReference = try implementation.addDocument(collectionReference: collectionReference, data: data) { error in
                self.pendingActions -= 1
                if error != nil {
                    call.reject("Document update error", nil, error, [:])
                    return
                }
            }
            call.resolve([
                "id": documentReference!.documentID,
                "path": documentReference!.path
            ])
        } catch CapacitorFirestoreError.runtimeError(let message) {
            call.reject(message)
        } catch {
            call.reject("Unknown error", nil, error, [:])
        }
    }

    @objc func addCollectionSnapshotListener(_ call: CAPPluginCall) {
        call.keepAlive = true
        let callbackId = call.callbackId

        guard let callbackId = callbackId as String? else {
            call.reject("unable to obtain callbackId from Capacitor")
            return
        }

        let collectionReference = call.getString("reference")
        let clientQueryConstraints = call.getArray("queryConstraints", JSObject.self)

        do {
            let queryConstaints = try implementation.ConvertJSArrayToQueryConstraints(array: clientQueryConstraints)

            let listener = try implementation.addCollectionSnapshotListener(collectionReference: collectionReference, queryConstaints: queryConstaints) { value, error in
                if error != nil {
                    call.reject("Collection snapshot error", nil, error, [:])
                } else {
                    let docs = value!.documents
                    var data: [JSObject] = []

                    do {
                        for item in docs {
                            let result = try self.implementation.ConvertSnapshotToJSObject(documentSnapshot: item)
                            data.append(result)
                        }
                    } catch CapacitorFirestoreError.runtimeError(let message) {
                        call.reject(message)
                        return
                    } catch {
                        call.reject("Unknown error", nil, error, [:])
                        return
                    }

                    call.resolve([
                        "collection": data
                    ])
                }
            }

            listeners[callbackId] = listener
        } catch CapacitorFirestoreError.runtimeError(let message) {
            call.reject(message)
        } catch {
            call.reject("Unknown error", nil, error, [:])
        }
    }

    @objc func getCollection(_ call: CAPPluginCall) {
        let collectionReference = call.getString("reference")
        let clientQueryConstraints = call.getArray("queryConstraints", JSObject.self)

        do {
            let queryConstaints = try implementation.ConvertJSArrayToQueryConstraints(array: clientQueryConstraints)

            try implementation.getCollection(collectionReference: collectionReference, queryConstaints: queryConstaints) { value, error in
                if error != nil {
                    call.reject("Collection snapshot error", nil, error, [:])
                } else {
                    let docs = value!.documents
                    var data: [JSObject] = []

                    for item in docs {
                        do {
                            let result = try self.implementation.ConvertSnapshotToJSObject(documentSnapshot: item)
                            data.append(result)
                        } catch CapacitorFirestoreError.runtimeError(let message) {
                            call.reject(message)
                            return
                        } catch {
                            call.reject("Unknown error", nil, error, [:])
                            return
                        }
                    }

                    call.resolve([
                        "collection": data
                    ])
                }
            }
        } catch CapacitorFirestoreError.runtimeError(let message) {
            call.reject(message)
        } catch {
            call.reject("Unknown error", nil, error, [:])
        }
    }

    @objc func enableNetwork(_ call: CAPPluginCall) {
        implementation.enableNetwork { error in
            if error != nil {
                call.reject("Error enabling network", nil, error, [:])
            } else {
                call.resolve()
            }
        }
    }

    @objc func disableNetwork(_ call: CAPPluginCall) {
        implementation.disableNetwork { error in
            if error != nil {
                call.reject("Error disabling netowrk", nil, error, [:])
            } else {
                call.resolve()
            }
        }
    }
}
