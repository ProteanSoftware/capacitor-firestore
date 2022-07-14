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
    private var app: FirebaseApp? = nil;
    
    @objc public func Initialize(projectId: String?, applicationId: String?, apiKey: String?) throws -> Void {
        guard let projectId = projectId as String? else {
            throw CapacitorFirestoreError.runtimeError("ProjectId must not be null");
        }

        guard let applicationId = applicationId as String? else {
            throw CapacitorFirestoreError.runtimeError("ApplicationId must not be null");
        }
        
        guard let apiKey = apiKey as String? else {
            throw CapacitorFirestoreError.runtimeError("apiKey must not be null");
        }
        
        let options = FirebaseOptions(googleAppID: applicationId, gcmSenderID: "");
            
        options.apiKey = apiKey;
        options.projectID = projectId;

        if (self.app != nil) {
            app?.delete() { error in
                if (error) {
                    print(error);
                } else {
                    do {
                        self.db = nil;
                        FirebaseApp.configure(name: "CapacitorFirestore", options: options);
                        self.app = FirebaseApp.app(name: "CapacitorFirestore")!;
                        try self.InitializeFirestore();
                    } catch {
                        print(error);
                    }
                }
            };
        } else {
            FirebaseApp.configure(name: "CapacitorFirestore", options: options);
            self.app = FirebaseApp.app(name: "CapacitorFirestore")!;
            try self.InitializeFirestore();
        }
    }
    
    @objc public func signInWithCustomToken(token: String?, completion: @escaping (AuthDataResult?, Error?) -> Void) throws -> Void {
        guard let token = token as String? else {
            throw CapacitorFirestoreError.runtimeError("token must not be null");
        }
        
        guard let app = self.app as FirebaseApp?
          else {
            throw CapacitorFirestoreError.runtimeError("signInWithCustomToken - app must be initialized first");
        }
        let auth = FirebaseAuth.Auth.auth(app: app);
        auth.signIn(withCustomToken: token) { user, error in
            completion(user, error);
        };
    }
    
    public func addDocumentSnapshotListener(documentReference: String?, completion: @escaping (DocumentSnapshot?, Error?) -> Void) throws -> ListenerRegistration? {
        guard let documentReference = documentReference as String? else {
            throw CapacitorFirestoreError.runtimeError("documentReference must not be null");
        }
        
        return self.db?.document(documentReference).addSnapshotListener(completion);
    }
    
    @objc public func getDocument(documentReference: String?, completion: @escaping (DocumentSnapshot?, Error?) -> Void) throws -> Void {
        guard let documentReference = documentReference as String? else {
            throw CapacitorFirestoreError.runtimeError("documentReference must not be null");
        }
        
        self.db?.document(documentReference).getDocument(completion: completion);
    }
    
    public func updateDocument(documentReference: String?, data: JSObject?, completion: @escaping (Error?) -> Void) throws -> Void {
        guard let documentReference = documentReference as String? else {
            throw CapacitorFirestoreError.runtimeError("documentReference must not be null");
        }
        
        guard let data = data as JSObject? else {
            throw CapacitorFirestoreError.runtimeError("data must not be null");
        }
        
        let documentData = try self.PrepDataForSend(inputData: data);
        
        self.db?.document(documentReference).updateData(documentData, completion: completion);
    }
    
    public func setDocument(documentReference: String?, data: JSObject?, merge: Bool, completion: @escaping (Error?) -> Void) throws -> Void {
        guard let documentReference = documentReference as String? else {
            throw CapacitorFirestoreError.runtimeError("documentReference must not be null");
        }
        
        guard let data = data as JSObject? else {
            throw CapacitorFirestoreError.runtimeError("data must not be null");
        }
        
        let documentData = try self.PrepDataForSend(inputData: data);
        
        self.db?.document(documentReference).setData(documentData, merge: merge, completion: completion);
    }
    
    public func deleteDocument(documentReference: String?, completion: @escaping (Error?) -> Void) throws -> Void {
        guard let documentReference = documentReference as String? else {
            throw CapacitorFirestoreError.runtimeError("documentReference must not be null");
        }
        
        self.db?.document(documentReference).delete(completion: completion);
    }
    
    public func addDocument(collectionReference: String?, data: JSObject?, completion: @escaping (Error?) -> Void) throws -> DocumentReference? {
        guard let collectionReference = collectionReference as String? else {
            throw CapacitorFirestoreError.runtimeError("collectionReference must not be null");
        }
        
        guard let data = data as JSObject? else {
            throw CapacitorFirestoreError.runtimeError("data must not be null");
        }
        
        let documentData = try self.PrepDataForSend(inputData: data);
        
        let documentReference = self.db?.collection(collectionReference).addDocument(data: documentData, completion: completion);
        
        return documentReference;
    }
    
    public func addCollectionSnapshotListener(collectionReference: String?, queryConstaints: [JSQueryConstraints]?, completion: @escaping (QuerySnapshot?, Error?) -> Void) throws -> ListenerRegistration? {
        guard let collectionReference = collectionReference as String? else {
            throw CapacitorFirestoreError.runtimeError("collectionReference must not be null");
        }
        
        var collection = self.db?.collection(collectionReference) as? Query;
        
        if let queryConstaints = queryConstaints {
            for queryConstraint in queryConstaints {

                switch (queryConstraint.operation) {
                    case "==":
                        collection = collection?.whereField(queryConstraint.fieldPath, isEqualTo: queryConstraint.value);
                        break;
                    case ">=":
                        collection = collection?.whereField(queryConstraint.fieldPath, isGreaterThanOrEqualTo: queryConstraint.value);
                        break;
                    case "<=":
                        collection = collection?.whereField(queryConstraint.fieldPath, isLessThanOrEqualTo: queryConstraint.value);
                        break;
                    case ">":
                        collection = collection?.whereField(queryConstraint.fieldPath, isGreaterThan: queryConstraint.value);
                        break;
                    case "<":
                        collection = collection?.whereField(queryConstraint.fieldPath, isLessThan: queryConstraint.value);
                        break;
                    case "array-contains":
                        collection = collection?.whereField(queryConstraint.fieldPath, arrayContains: queryConstraint.value);
                        break;
                    default:
                        throw CapacitorFirestoreError.runtimeError("query operation not support: " + queryConstraint.operation);
                }
            }
        }
        
        return collection?.addSnapshotListener(completion);
    }

    @objc public func getCollection(collectionReference: String?, queryConstaints: [JSQueryConstraints]?, completion: @escaping (QuerySnapshot?, Error?) -> Void) throws -> Void {
        guard let collectionReference = collectionReference as String? else {
            throw CapacitorFirestoreError.runtimeError("collectionReference must not be null");
        }
        
        var collection = self.db?.collection(collectionReference) as? Query;
        
        if let queryConstaints = queryConstaints {
            for queryConstraint in queryConstaints {

                switch (queryConstraint.operation) {
                    case "==":
                        collection = collection?.whereField(queryConstraint.fieldPath, isEqualTo: queryConstraint.value);
                        break;
                    case ">=":
                        collection = collection?.whereField(queryConstraint.fieldPath, isGreaterThanOrEqualTo: queryConstraint.value);
                        break;
                    case "<=":
                        collection = collection?.whereField(queryConstraint.fieldPath, isLessThanOrEqualTo: queryConstraint.value);
                        break;
                    case ">":
                        collection = collection?.whereField(queryConstraint.fieldPath, isGreaterThan: queryConstraint.value);
                        break;
                    case "<":
                        collection = collection?.whereField(queryConstraint.fieldPath, isLessThan: queryConstraint.value);
                        break;
                    case "array-contains":
                        collection = collection?.whereField(queryConstraint.fieldPath, arrayContains: queryConstraint.value);
                        break;
                    default:
                        throw CapacitorFirestoreError.runtimeError("query operation not support: " + queryConstraint.operation);
                }
            }
        }
        
        collection?.getDocuments(completion: completion);
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
    
    public func ConvertSnapshotToJSObject(documentSnapshot: DocumentSnapshot?) throws -> JSObject {
        guard let documentSnapshot = documentSnapshot as DocumentSnapshot? else {
            throw CapacitorFirestoreError.runtimeError("documentSnapshot must not be null");
        }
        
        var result = JSObject();
        result["id"] = documentSnapshot.documentID;
        result["path"] = documentSnapshot.reference.path;

        if (documentSnapshot.exists) {
            var data = JSObject();
            guard let documentData = documentSnapshot.data() as [String : Any]? else {
                throw CapacitorFirestoreError.runtimeError("should not be possible, document exists but no data");
            }
            
            try documentData.keys.forEach { key in
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
                        throw CapacitorFirestoreError.runtimeError("should not be possible, already guard against null");
                    }
                    
                    guard let value = JSTypes.coerceDictionaryToJSObject([key:value]) as JSObject? else {
                        throw CapacitorFirestoreError.runtimeError("could not deserailize value for: " + key);
                    }

                    data[key] = value[key];
                }
            }
            
            
            result["data"] = data;
        }

        return result;
    }
    
    @objc public func enableNetwork(completion: @escaping (Error?) -> Void) -> Void {
        self.db?.enableNetwork(completion: completion)
    }
    
    @objc public func disableNetwork(completion: @escaping (Error?) -> Void) -> Void {
        self.db?.disableNetwork(completion: completion)
    }
    
    private func PrepDataForSend(inputData: JSObject) throws -> Dictionary<String, Any> {
        var returnData: [String: Any] = [:];
        let data = inputData;
        try data.keys.forEach { key in
            let value = data[key];

            // magic bool fix
            if self.isBoolNumber(num: value) {
                returnData[key] = value as! Bool;
            }
            // magic int fix
            else if let numberValue = value as? Int {
                returnData[key] = numberValue;
            } else if let timestampValue = value as? JSObject {
                if (timestampValue.keys.contains("specialType")) {
                    let specialType = timestampValue["specialType"] as! String;
                    
                    switch specialType {
                    case "Timestamp":
                        let timestamp = FirebaseFirestore.Timestamp(seconds: Int64(timestampValue["seconds"] as! Int), nanoseconds: Int32(timestampValue["nanoseconds"] as! Int));
                        returnData[key] = timestamp;

                        break;
                    default:
                        throw CapacitorFirestoreError.runtimeError("Unhandled specialType: " + specialType);
                    }
                } else {
                    returnData[key] = value;
                }
            } else {
                returnData[key] = value;
            }
        }
        
        return returnData;
    }
    
    @objc private func InitializeFirestore() throws -> Void {
        guard let app = self.app as FirebaseApp?
          else {
            throw CapacitorFirestoreError.runtimeError("InitializeFirestore - app must be initialized first");
        }
        
        let settings = FirestoreSettings();
        settings.isPersistenceEnabled = true;
        settings.cacheSizeBytes = FirestoreCacheSizeUnlimited;
        
        if (self.db != nil) {
            self.db?.terminate() { error in
                if (error != nil) {
                    self.db = Firestore.firestore(app: app);
                    self.db?.settings = settings;
                }
            }
        } else {
            self.db = Firestore.firestore(app: app);
            self.db?.settings = settings;
        }
    }
    
    // https://stackoverflow.com/a/30223989
    private func isBoolNumber(num: JSValue?) -> Bool {
        if let nsNumberValue = num as? NSNumber {
            let boolId = CFBooleanGetTypeID(); // the type ID of CFBoolean
            let numId = CFGetTypeID(nsNumberValue); // the type ID of num
            return numId == boolId;
        }
        
        return false;
    }
}
