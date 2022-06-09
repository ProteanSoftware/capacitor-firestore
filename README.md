# @proteansoftware/capacitor-firestore

Capacitor Plugin for Native Firestore

## Install

```bash
npm install @proteansoftware/capacitor-firestore
npx cap sync
```

## API

<docgen-index>

* [`initializeFirestore(...)`](#initializefirestore)
* [`signInWithCustomToken(...)`](#signinwithcustomtoken)
* [`getDocument(...)`](#getdocument)
* [`updateDocument(...)`](#updatedocument)
* [`setDocument(...)`](#setdocument)
* [`deleteDocument(...)`](#deletedocument)
* [`addDocument(...)`](#adddocument)
* [`addDocumentSnapshotListener(...)`](#adddocumentsnapshotlistener)
* [`getCollection(...)`](#getcollection)
* [`addCollectionSnapshotListener(...)`](#addcollectionsnapshotlistener)
* [`removeSnapshotListener(...)`](#removesnapshotlistener)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### initializeFirestore(...)

```typescript
initializeFirestore(options: FirestoreConfig) => Promise<void>
```

Configure the firestore instance with new configuration options.

| Param         | Type                                                        |
| ------------- | ----------------------------------------------------------- |
| **`options`** | <code><a href="#firestoreconfig">FirestoreConfig</a></code> |

--------------------


### signInWithCustomToken(...)

```typescript
signInWithCustomToken(options: CustomToken) => Promise<void>
```

Login to firestore using a customer JWT token.

| Param         | Type                                                |
| ------------- | --------------------------------------------------- |
| **`options`** | <code><a href="#customtoken">CustomToken</a></code> |

--------------------


### getDocument(...)

```typescript
getDocument<T>(options: DocumnentQuery) => Promise<DocumentSnapshot<T>>
```

Reads the document referred to by this <a href="#documnentquery">DocumnentQuery</a>

| Param         | Type                                                      |
| ------------- | --------------------------------------------------------- |
| **`options`** | <code><a href="#documnentquery">DocumnentQuery</a></code> |

**Returns:** <code>Promise&lt;<a href="#documentsnapshot">DocumentSnapshot</a>&lt;T&gt;&gt;</code>

--------------------


### updateDocument(...)

```typescript
updateDocument<T>(options: UpdateDocument<T>) => Promise<void>
```

Updates fields in the document referred to by the specified <a href="#documnentquery">DocumnentQuery</a>.
The update will fail if applied to a document that does not exist.

| Param         | Type                                                               |
| ------------- | ------------------------------------------------------------------ |
| **`options`** | <code><a href="#updatedocument">UpdateDocument</a>&lt;T&gt;</code> |

--------------------


### setDocument(...)

```typescript
setDocument<T>(options: SetDocument<T>) => Promise<void>
```

Writes to the document referred to by the specified <a href="#documnentquery">DocumnentQuery</a>.
If the document does not yet exist, it will be created.
If you provide merge or mergeFields, the provided data can be merged into an existing document.

| Param         | Type                                                         |
| ------------- | ------------------------------------------------------------ |
| **`options`** | <code><a href="#setdocument">SetDocument</a>&lt;T&gt;</code> |

--------------------


### deleteDocument(...)

```typescript
deleteDocument(options: DocumnentQuery) => Promise<void>
```

Deletes the document referred to by the specified <a href="#documnentquery">DocumnentQuery</a>.

| Param         | Type                                                      |
| ------------- | --------------------------------------------------------- |
| **`options`** | <code><a href="#documnentquery">DocumnentQuery</a></code> |

--------------------


### addDocument(...)

```typescript
addDocument<T>(options: AddDocument<T>) => Promise<DocumentReference>
```

Add a new document to specified <a href="#collectionquery">`CollectionQuery`</a> with the given data,
assigning it a document ID automatically.

| Param         | Type                                                         |
| ------------- | ------------------------------------------------------------ |
| **`options`** | <code><a href="#adddocument">AddDocument</a>&lt;T&gt;</code> |

**Returns:** <code>Promise&lt;<a href="#documentreference">DocumentReference</a>&gt;</code>

--------------------


### addDocumentSnapshotListener(...)

```typescript
addDocumentSnapshotListener<T>(options: DocumnentQuery, callback: DocumentSnapshotCallback<T>) => Promise<CallbackId>
```

Listen for snapshot changes on a document.

| Param          | Type                                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| **`options`**  | <code><a href="#documnentquery">DocumnentQuery</a></code>                              |
| **`callback`** | <code><a href="#documentsnapshotcallback">DocumentSnapshotCallback</a>&lt;T&gt;</code> |

**Returns:** <code>Promise&lt;string&gt;</code>

--------------------


### getCollection(...)

```typescript
getCollection<T>(options: CollectionQuery) => Promise<CollectionSnapshot<T>>
```

Executes the query and returns the results as a <a href="#collectionsnapshot">CollectionSnapshot</a>

| Param         | Type                                                        |
| ------------- | ----------------------------------------------------------- |
| **`options`** | <code><a href="#collectionquery">CollectionQuery</a></code> |

**Returns:** <code>Promise&lt;<a href="#collectionsnapshot">CollectionSnapshot</a>&lt;T&gt;&gt;</code>

--------------------


### addCollectionSnapshotListener(...)

```typescript
addCollectionSnapshotListener<T>(options: CollectionQuery, callback: CollectionSnapshotCallback<T>) => Promise<CallbackId>
```

Listen for snapshot changes on a collection.

| Param          | Type                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| **`options`**  | <code><a href="#collectionquery">CollectionQuery</a></code>                                |
| **`callback`** | <code><a href="#collectionsnapshotcallback">CollectionSnapshotCallback</a>&lt;T&gt;</code> |

**Returns:** <code>Promise&lt;string&gt;</code>

--------------------


### removeSnapshotListener(...)

```typescript
removeSnapshotListener(options: RemoveSnapshotListener) => Promise<void>
```

Stop listening for snapshot changes on a document or collection.

| Param         | Type                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| **`options`** | <code><a href="#removesnapshotlistener">RemoveSnapshotListener</a></code> |

--------------------


### Interfaces


#### FirestoreConfig

| Prop                | Type                | Description                     | Since |
| ------------------- | ------------------- | ------------------------------- | ----- |
| **`projectId`**     | <code>string</code> | Set the GCP/Firebase project id | 1.0.0 |
| **`applicationId`** | <code>string</code> | Set the Firebase application id | 1.0.0 |
| **`apiKey`**        | <code>string</code> | Set the Firebase api key        | 1.0.0 |


#### CustomToken

| Prop        | Type                |
| ----------- | ------------------- |
| **`token`** | <code>string</code> |


#### DocumentSnapshot

| Prop       | Type                   | Description                                                       | Since |
| ---------- | ---------------------- | ----------------------------------------------------------------- | ----- |
| **`data`** | <code>T \| null</code> | The fields of the document or null if the document doesn't exist. | 1.0.0 |


#### DocumnentQuery

| Prop            | Type                | Description                            |
| --------------- | ------------------- | -------------------------------------- |
| **`reference`** | <code>string</code> | A reference to the document/collection |


#### UpdateDocument

| Prop       | Type                                                 | Description                                                                                                                                          |
| ---------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`data`** | <code><a href="#partial">Partial</a>&lt;T&gt;</code> | An object containing the fields and values with which to update the document. Fields can contain dots to reference nested fields within the document |


#### SetDocument

| Prop        | Type                 | Description                                                                                                                                                                                                                                               |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`data`**  | <code>T</code>       | A map of the fields and values for the document.                                                                                                                                                                                                          |
| **`merge`** | <code>boolean</code> | Changes the behavior of a `setDocument()` call to only replace the values specified in its data argument. Fields omitted from the `setDocument()` call remain untouched. If your input sets any field to an empty map, all nested fields are overwritten. |


#### DocumentReference

| Prop       | Type                | Description                                                                                       | Since |
| ---------- | ------------------- | ------------------------------------------------------------------------------------------------- | ----- |
| **`id`**   | <code>string</code> | The id of the document.                                                                           | 1.0.0 |
| **`path`** | <code>string</code> | A string representing the path of the referenced document (relative to the root of the database). | 1.0.0 |


#### AddDocument

| Prop       | Type           | Description                                         |
| ---------- | -------------- | --------------------------------------------------- |
| **`data`** | <code>T</code> | An Object containing the data for the new document. |


#### CollectionSnapshot

| Prop             | Type                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| **`collection`** | <code><a href="#documentsnapshot">DocumentSnapshot</a>&lt;T&gt;[]</code> |


#### CollectionQuery

| Prop                   | Type                           |
| ---------------------- | ------------------------------ |
| **`queryConstraints`** | <code>QueryConstraint[]</code> |


#### QueryConstraint

A <a href="#queryconstraint">`QueryConstraint`</a> is used to narrow the set of documents returned by a
Firestore query.

| Prop            | Type                                                      | Description                                                                               |
| --------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **`fieldPath`** | <code>string</code>                                       | The path to compare                                                                       |
| **`opStr`**     | <code><a href="#queryoperators">QueryOperators</a></code> | The operation string (e.g "&lt;", "&lt;=", "==", "&lt;", "&lt;=", "!=", "array-contains") |
| **`value`**     | <code>any</code>                                          | The value for comparison                                                                  |


#### RemoveSnapshotListener

| Prop             | Type                                              |
| ---------------- | ------------------------------------------------- |
| **`callbackId`** | <code><a href="#callbackid">CallbackId</a></code> |


### Type Aliases


#### Partial

Make all properties in T optional

<code>{ [P in keyof T]?: T[P]; }</code>


#### DocumentSnapshotCallback

<code>(data: <a href="#documentsnapshot">DocumentSnapshot</a>&lt;T&gt; | null, err?: any): void</code>


#### CallbackId

<code>string</code>


#### QueryOperators

Filter conditions in a {@link <a href="#queryconstraint">QueryConstraint</a>} clause are specified using the
strings '&lt;', '&lt;=', '==', '&gt;=', '&gt;', 'array-contains'

<code>"==" | "&gt;=" | "&lt;=" | "&lt;" | "&gt;" | "array-contains"</code>


#### CollectionSnapshotCallback

<code>(data: <a href="#collectionsnapshot">CollectionSnapshot</a>&lt;T&gt; | null, err?: any): void</code>

</docgen-api>
