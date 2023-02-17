import Foundation
import Capacitor
import FirebaseCore
import FirebaseFirestore
import FirebaseAuth

enum CapacitorFirestoreError: Error {
    case runtimeError(String)
}

@objc public class CapacitorFirestore: NSObject {
    private var db: Firestore?
    private var app: FirebaseApp?
    private var firebaseOptions: FirebaseOptions?

    @objc public func Initialize(projectId: String?, applicationId: String?, apiKey: String?) throws {
        guard let projectId = projectId as String? else {
            throw CapacitorFirestoreError.runtimeError("ProjectId must not be null")
        }

        guard let applicationId = applicationId as String? else {
            throw CapacitorFirestoreError.runtimeError("ApplicationId must not be null")
        }

        guard let apiKey = apiKey as String? else {
            throw CapacitorFirestoreError.runtimeError("apiKey must not be null")
        }

        self.firebaseOptions = FirebaseOptions(googleAppID: applicationId, gcmSenderID: "")

        self.firebaseOptions!.apiKey = apiKey
        self.firebaseOptions!.projectID = projectId

        try self.configure()
    }

    @objc public func signOut() throws {
        guard let app = self.app as FirebaseApp?
        else {
            throw CapacitorFirestoreError.runtimeError("signInWithCustomToken - app must be initialized first")
        }
        let auth = FirebaseAuth.Auth.auth(app: app)

        do {
            try auth.signOut()
        } catch let signOutError as NSError {
            throw CapacitorFirestoreError.runtimeError("signOut - " + signOutError.localizedDescription)
        }
    }

    @objc public func signInWithCustomToken(token: String?, completion: @escaping (AuthDataResult?, Error?) -> Void) throws {
        guard let token = token as String? else {
            throw CapacitorFirestoreError.runtimeError("token must not be null")
        }

        guard let app = self.app as FirebaseApp?
        else {
            throw CapacitorFirestoreError.runtimeError("signInWithCustomToken - app must be initialized first")
        }
        let auth = FirebaseAuth.Auth.auth(app: app)
        auth.signIn(withCustomToken: token) { user, error in
            completion(user, error)
        }
    }

    public func addDocumentSnapshotListener(documentReference: String?, completion: @escaping (DocumentSnapshot?, Error?) -> Void) throws -> ListenerRegistration? {
        guard let documentReference = documentReference as String? else {
            throw CapacitorFirestoreError.runtimeError("documentReference must not be null")
        }

        return self.db?.document(documentReference).addSnapshotListener(completion)
    }

    @objc public func getDocument(documentReference: String?, completion: @escaping (DocumentSnapshot?, Error?) -> Void) throws {
        guard let documentReference = documentReference as String? else {
            throw CapacitorFirestoreError.runtimeError("documentReference must not be null")
        }

        self.db?.document(documentReference).getDocument(completion: completion)
    }

    public func updateDocument(documentReference: String?, data: JSObject?, completion: @escaping (Error?) -> Void) throws {
        guard let documentReference = documentReference as String? else {
            throw CapacitorFirestoreError.runtimeError("documentReference must not be null")
        }

        guard let data = data as JSObject? else {
            throw CapacitorFirestoreError.runtimeError("data must not be null")
        }

        let documentData = try self.PrepDataForSend(inputData: data)

        self.db?.document(documentReference).updateData(documentData, completion: completion)
    }

    public func setDocument(documentReference: String?, data: JSObject?, merge: Bool, completion: @escaping (Error?) -> Void) throws {
        guard let documentReference = documentReference as String? else {
            throw CapacitorFirestoreError.runtimeError("documentReference must not be null")
        }

        guard let data = data as JSObject? else {
            throw CapacitorFirestoreError.runtimeError("data must not be null")
        }

        let documentData = try self.PrepDataForSend(inputData: data)

        self.db?.document(documentReference).setData(documentData, merge: merge, completion: completion)
    }

    public func deleteDocument(documentReference: String?, completion: @escaping (Error?) -> Void) throws {
        guard let documentReference = documentReference as String? else {
            throw CapacitorFirestoreError.runtimeError("documentReference must not be null")
        }

        self.db?.document(documentReference).delete(completion: completion)
    }

    public func addDocument(collectionReference: String?, data: JSObject?, completion: @escaping (Error?) -> Void) throws -> DocumentReference? {
        guard let collectionReference = collectionReference as String? else {
            throw CapacitorFirestoreError.runtimeError("collectionReference must not be null")
        }

        guard let data = data as JSObject? else {
            throw CapacitorFirestoreError.runtimeError("data must not be null")
        }

        let documentData = try self.PrepDataForSend(inputData: data)

        let documentReference = self.db?.collection(collectionReference).addDocument(data: documentData, completion: completion)

        return documentReference
    }

    public func addCollectionSnapshotListener(collectionReference: String?, queryConstaints: [JSQueryConstraints]?, completion: @escaping (QuerySnapshot?, Error?) -> Void) throws -> ListenerRegistration? {
        guard let collectionReference = collectionReference as String? else {
            throw CapacitorFirestoreError.runtimeError("collectionReference must not be null")
        }

        var collection = self.db?.collection(collectionReference) as? Query

        if let queryConstaints = queryConstaints {
            for queryConstraint in queryConstaints {

                switch queryConstraint.operation {
                case "==":
                    collection = collection?.whereField(queryConstraint.fieldPath, isEqualTo: queryConstraint.value)
                    break
                case ">=":
                    collection = collection?.whereField(queryConstraint.fieldPath, isGreaterThanOrEqualTo: queryConstraint.value)
                    break
                case "<=":
                    collection = collection?.whereField(queryConstraint.fieldPath, isLessThanOrEqualTo: queryConstraint.value)
                    break
                case ">":
                    collection = collection?.whereField(queryConstraint.fieldPath, isGreaterThan: queryConstraint.value)
                    break
                case "<":
                    collection = collection?.whereField(queryConstraint.fieldPath, isLessThan: queryConstraint.value)
                    break
                case "array-contains":
                    collection = collection?.whereField(queryConstraint.fieldPath, arrayContains: queryConstraint.value)
                    break
                default:
                    throw CapacitorFirestoreError.runtimeError("query operation not support: " + queryConstraint.operation)
                }
            }
        }

        return collection?.addSnapshotListener(completion)
    }

    @objc public func getCollection(collectionReference: String?, queryConstaints: [JSQueryConstraints]?, completion: @escaping (QuerySnapshot?, Error?) -> Void) throws {
        guard let collectionReference = collectionReference as String? else {
            throw CapacitorFirestoreError.runtimeError("collectionReference must not be null")
        }

        var collection = self.db?.collection(collectionReference) as? Query

        if let queryConstaints = queryConstaints {
            for queryConstraint in queryConstaints {

                switch queryConstraint.operation {
                case "==":
                    collection = collection?.whereField(queryConstraint.fieldPath, isEqualTo: queryConstraint.value)
                    break
                case ">=":
                    collection = collection?.whereField(queryConstraint.fieldPath, isGreaterThanOrEqualTo: queryConstraint.value)
                    break
                case "<=":
                    collection = collection?.whereField(queryConstraint.fieldPath, isLessThanOrEqualTo: queryConstraint.value)
                    break
                case ">":
                    collection = collection?.whereField(queryConstraint.fieldPath, isGreaterThan: queryConstraint.value)
                    break
                case "<":
                    collection = collection?.whereField(queryConstraint.fieldPath, isLessThan: queryConstraint.value)
                    break
                case "array-contains":
                    collection = collection?.whereField(queryConstraint.fieldPath, arrayContains: queryConstraint.value)
                    break
                default:
                    throw CapacitorFirestoreError.runtimeError("query operation not support: " + queryConstraint.operation)
                }
            }
        }

        collection?.getDocuments(completion: completion)
    }

    public func ConvertJSArrayToQueryConstraints(array: [JSObject]?) throws -> [JSQueryConstraints]? {
        if array == nil {
            return nil
        }

        var list: [JSQueryConstraints] = []

        for item in array! {
            let fieldPath = item["fieldPath"] as! String
            let operation = item["opStr"] as! String
            let jsValue = item["value"]
            var value: Any

            switch jsValue {
            case let dictionaryValue as NSDictionary:
                let keys = dictionaryValue.allKeys.compactMap { $0 as? String }

                if keys.contains("seconds") && keys.contains("nanoseconds") {
                    value = FirebaseFirestore.Timestamp(seconds: dictionaryValue["seconds"] as! Int64, nanoseconds: dictionaryValue["nanoseconds"] as! Int32)
                } else {
                    throw CapacitorFirestoreError.runtimeError("unhandled JSONObject type for fieldPath: " + fieldPath)
                }
                break
            case let numberValue as NSNumber:
                value = Int(truncating: numberValue)
                break
            case let stringValue as NSString:
                value = String(stringValue)
                break
            default:
                value = jsValue as Any
                break
            }

            list.append(JSQueryConstraints(fieldPath: fieldPath, operation: operation, value: value))
        }

        return list
    }

    public func ConvertSnapshotToJSObject(documentSnapshot: DocumentSnapshot?) throws -> JSObject {
        guard let documentSnapshot = documentSnapshot as DocumentSnapshot? else {
            throw CapacitorFirestoreError.runtimeError("documentSnapshot must not be null")
        }

        var result = JSObject()
        result["id"] = documentSnapshot.documentID
        result["path"] = documentSnapshot.reference.path

        if documentSnapshot.exists {
            var data = JSObject()
            guard let documentData = documentSnapshot.data() as [String: Any]? else {
                throw CapacitorFirestoreError.runtimeError("should not be possible, document exists but no data")
            }

            try documentData.keys.forEach { key in
                let value = documentData[key]
                try data[key] = self.SafeReadValue(key: key, value: value)
            }

            result["data"] = data
        }

        return result
    }

    private func SafeReadValue(key: String, value: Any?) throws -> JSValue? {
        if value == nil {
            return nil
        } else if let timestampValue = value as? FirebaseFirestore.Timestamp {
            var jsonObject = JSObject()
            jsonObject["seconds"] = Int(timestampValue.seconds)
            jsonObject["nanoseconds"] = Int(timestampValue.nanoseconds)
            jsonObject["specialType"] = "Timestamp"

            return jsonObject
        } else if let arrayValue = value as? [Any] {
            var jsonArray = JSArray()
            for arrayItem in arrayValue {
                let safeValue = try self.SafeReadValue(key: key, value: arrayItem)
                if safeValue == nil {
                    continue
                }
                jsonArray.append(safeValue!)
            }

            return jsonArray
        } else if let arrayValue = value as? NSArray {
            var jsonArray = JSArray()
            for arrayItem in arrayValue {
                let safeValue = try self.SafeReadValue(key: key, value: arrayItem)
                if safeValue == nil {
                    continue
                }
                jsonArray.append(safeValue!)
            }
            return jsonArray
        } else if let dictionaryValue = value as? NSDictionary {
            let keys = dictionaryValue.allKeys.compactMap { $0 as? String }
            var result: JSObject = [:]
            for key in keys {
                try result[key] = self.SafeReadValue(key: key, value: dictionaryValue[key])
            }
            return result
        } else {
            guard let value = value as Any? else {
                throw CapacitorFirestoreError.runtimeError("should not be possible, already guard against null")
            }

            guard let value = JSTypes.coerceDictionaryToJSObject([key: value]) as JSObject? else {
                throw CapacitorFirestoreError.runtimeError("could not deserailize value for: " + key)
            }

            return value[key]
        }
    }

    @objc public func enableNetwork(completion: @escaping (Error?) -> Void) {
        self.db?.enableNetwork(completion: completion)
    }

    @objc public func disableNetwork(completion: @escaping (Error?) -> Void) {
        self.db?.disableNetwork(completion: completion)
    }

    private func PrepDataForSend(inputData: JSObject) throws -> [String: Any] {
        var returnData: [String: Any] = [:]
        let data = inputData
        try data.keys.forEach { key in
            let value = data[key]
            try returnData[key] = self.SafeDataSend(value: value)
        }

        return returnData
    }

    private func SafeDataSend(value: JSValue?) throws -> Any? {
        // magic bool fix
        if self.isBoolNumber(num: value) {
            return value as! Bool
        }
        // magic int fix
        else if let numberValue = value as? Int {
            return numberValue
        } else if let arrayValue = value as? JSArray {
            var dataArray: [Any] = []
            for arrayItem in arrayValue {
                let safeArrayItem = try self.SafeDataSend(value: arrayItem)

                if safeArrayItem == nil {
                    continue
                }

                dataArray.append(safeArrayItem!)
            }

            return dataArray
        } else if let timestampValue = value as? JSObject {
            if timestampValue.keys.contains("specialType") {
                let specialType = timestampValue["specialType"] as! String

                switch specialType {
                case "Timestamp":
                    let timestamp = FirebaseFirestore.Timestamp(seconds: Int64(timestampValue["seconds"] as! Int), nanoseconds: Int32(timestampValue["nanoseconds"] as! Int))
                    return timestamp

                    break
                default:
                    throw CapacitorFirestoreError.runtimeError("Unhandled specialType: " + specialType)
                }
            } else {
                var safeObject: [String: Any] = [:]
                for itemKey in timestampValue.keys {
                    safeObject[itemKey] = try self.SafeDataSend(value: timestampValue[itemKey])
                }
                return safeObject
            }
        } else {
            return value
        }
    }

    @objc private func InitializeFirestore() throws {
        guard let app = self.app as FirebaseApp?
        else {
            throw CapacitorFirestoreError.runtimeError("InitializeFirestore - app must be initialized first")
        }

        let settings = FirestoreSettings()
        settings.isPersistenceEnabled = true
        settings.cacheSizeBytes = FirestoreCacheSizeUnlimited

        if self.db != nil {
            self.db?.terminate { error in
                if error != nil {
                    self.db = Firestore.firestore(app: app)
                    self.db?.settings = settings
                }
            }
        } else {
            self.db = Firestore.firestore(app: app)
            self.db?.settings = settings
        }
    }

    private func configure() throws {
        if self.app != nil {
            self.app?.delete { complete in
                if complete {
                    do {
                        self.db = nil
                        FirebaseApp.configure(name: "CapacitorFirestore", options: self.firebaseOptions!)
                        self.app = FirebaseApp.app(name: "CapacitorFirestore")!
                        try self.InitializeFirestore()
                    } catch {
                        print(error)
                    }
                }
            }
        } else {
            FirebaseApp.configure(name: "CapacitorFirestore", options: self.firebaseOptions!)
            self.app = FirebaseApp.app(name: "CapacitorFirestore")!
            try self.InitializeFirestore()
        }
    }

    // https://stackoverflow.com/a/30223989
    private func isBoolNumber(num: JSValue?) -> Bool {
        if let nsNumberValue = num as? NSNumber {
            let boolId = CFBooleanGetTypeID(); // the type ID of CFBoolean
            let numId = CFGetTypeID(nsNumberValue); // the type ID of num
            return numId == boolId
        }

        return false
    }
}
