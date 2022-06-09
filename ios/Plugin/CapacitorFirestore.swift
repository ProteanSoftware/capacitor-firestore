import Foundation
import Capacitor
import FirebaseCore
import FirebaseFirestore
import FirebaseAuth

enum CapacitorFirestoreError: Error {
    case runtimeError(String)
}

@objc public class CapacitorFirestore: NSObject {
    private var db: Firestore? = nil;
    
    @objc public func Initialize(projectId: String?, applicationId: String?, apiKey: String?) throws -> Void {
        guard let projectId = projectId as String? else {
            assert(false, "ProjectId must not be null");
        }

        guard let applicationId = applicationId as String? else {
            assert(false, "ApplicationId must not be null");
        }
        
        guard let apiKey = apiKey as String? else {
            assert(false, "apiKey must not be null");
        }
        
        let options = FirebaseOptions(googleAppID: applicationId, gcmSenderID: "");
            
        options.apiKey = apiKey;
        options.projectID = projectId;

        let app = FirebaseApp.app(name: "CapacitorFirestore");
        app?.delete({ _ in });
                
        FirebaseApp.configure(name: "CapacitorFirestore", options: options);

        try self.InitializeFirestore();
    }
    
    @objc public func signInWithCustomToken(token: String?, completion: @escaping (AuthDataResult?, Error?) -> Void) -> Void {
        guard let token = token as String? else {
            assert(false, "token must not be null");
        }
        
        guard let app = FirebaseApp.app(name: "CapacitorFirestore")
          else {
            assert(false, "app must be initialized first");
        }
        let auth = FirebaseAuth.Auth.auth(app: app);
        auth.signIn(withCustomToken: token) { user, error in
            completion(user, error);
        };
    }
    
    @objc public func addDocumentSnapshotListener(documentReference: String?, completion: @escaping (DocumentSnapshot?, Error?) -> Void) -> ListenerRegistration? {
        guard let documentReference = documentReference as String? else {
            assert(false, "documentReference must not be null");
        }
        
        return self.db?.document(documentReference).addSnapshotListener(completion);
    }
    
    @objc public func getDocument(documentReference: String?, completion: @escaping (DocumentSnapshot?, Error?) -> Void) -> Void {
        guard let documentReference = documentReference as String? else {
            assert(false, "documentReference must not be null");
        }
        
        self.db?.document(documentReference).getDocument(completion: completion);
    }
    
    public func updateDocument(documentReference: String?, data: JSObject?, completion: @escaping (Error?) -> Void) -> Void {
        guard let documentReference = documentReference as String? else {
            assert(false, "documentReference must not be null");
        }
        
        guard let data = data as JSObject? else {
            assert(false, "data must not be null");
        }
        
        self.db?.document(documentReference).updateData(data, completion: completion);
    }
    
    public func setDocument(documentReference: String?, data: JSObject?, merge: Bool, completion: @escaping (Error?) -> Void) -> Void {
        guard let documentReference = documentReference as String? else {
            assert(false, "documentReference must not be null");
        }
        
        guard let data = data as JSObject? else {
            assert(false, "data must not be null");
        }
        
        self.db?.document(documentReference).setData(data, merge: merge, completion: completion);
    }
    
    @objc public func addCollectionSnapshotListener(collectionReference: String?, queryConstaints: [JSQueryConstraints]?, completion: @escaping (QuerySnapshot?, Error?) -> Void) -> ListenerRegistration? {
        guard let collectionReference = collectionReference as String? else {
            assert(false, "collectionReference must not be null");
        }
        
        return self.db?.collection(collectionReference).addSnapshotListener(completion);
    }
    
    @objc public func getCollection(collectionReference: String?, completion: @escaping (QuerySnapshot?, Error?) -> Void) -> Void {
        guard let collectionReference = collectionReference as String? else {
            assert(false, "collectionReference must not be null");
        }
        
        self.db?.collection(collectionReference).getDocuments(completion: completion);
    }
    
    
    public func ConvertJSArrayToQueryConstraints(array: [JSObject]?) throws -> [JSQueryConstraints]? {
        if (array == nil) {
            return nil;
        }
        
        var list: [JSQueryConstraints] = [];
        
        for item in array! {
            let fieldPath = item["fieldPath"] as! String;
            let operation = item["opStr"] as! String;
            let jsValue = item["value"];
            var value: Any;
            
            switch jsValue {
            case let dictionaryValue as NSDictionary:
                let keys = dictionaryValue.allKeys.compactMap { $0 as? String }
                
                if (keys.contains("seconds") && keys.contains("nanoseconds")) {
                    value = FirebaseFirestore.Timestamp(seconds: dictionaryValue["seconds"] as! Int64, nanoseconds: dictionaryValue["nanoseconds"] as! Int32);
                } else {
                    throw CapacitorFirestoreError.runtimeError("unhandled JSONObject type for fieldPath: " + fieldPath);
                }
                break;
            default:
                value = jsValue as Any;
                break;
            }
            
            list.append(JSQueryConstraints(fieldPath: fieldPath, operation: operation, value: value));
        }

        return list;
    }
    
    public func ConvertSnapshotToJSObject(documentSnapshot: DocumentSnapshot?) -> JSObject {
        guard let documentSnapshot = documentSnapshot as DocumentSnapshot? else {
            assert(false, "documentSnapshot must not be null");
        }
        
        var result = JSObject();
        result["id"] = documentSnapshot.documentID;
        if (documentSnapshot.exists) {
            var data = JSObject();
            guard let documentData = documentSnapshot.data() as [String : Any]? else {
                assert(false, "should not be possible, document exists but no data");
            }
            
            documentData.keys.forEach { key in
                let value = documentData[key];
                if value == nil {
                    data[key] = nil;
                } else if let timestampValue = value as? FirebaseFirestore.Timestamp {
                    var jsonObject = JSObject();
                    jsonObject["seconds"] = Int(timestampValue.seconds);
                    jsonObject["nanoseconds"] = Int(timestampValue.nanoseconds);
                    jsonObject["specialType"] = "Timestamp";
                    
                    data[key] = jsonObject;
                } else {
                    guard let value = value as Any? else {
                        assert(false, "should not be possible, already guard against null");
                    }
                    
                    guard let value = JSTypes.coerceDictionaryToJSObject([key:value]) as JSObject? else {
                        assert(false, "could not deserailize value for: " + key);
                    }

                    data[key] = value[key];
                }
            }
            
            
            result["data"] = data;
        }

        return result;
    }
    
    @objc private func InitializeFirestore() throws -> Void {
        guard let app = FirebaseApp.app(name: "CapacitorFirestore")
          else {
            assert(false, "app must be initialized first");
        }
        
        self.db?.terminate();

        self.db = Firestore.firestore(app: app);
        
        let settings = FirestoreSettings();
        settings.isPersistenceEnabled = true;
        settings.cacheSizeBytes = FirestoreCacheSizeUnlimited;
        self.db?.settings = settings;
    }
}
