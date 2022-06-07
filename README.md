# @proteansoftware/capacitor-firestore

Capacitor Plugin for Native Firestore

## Install

```bash
npm install @proteansoftware/capacitor-firestore
npx cap sync
```

## API

<docgen-index>

* [`signInWithCustomToken(...)`](#signinwithcustomtoken)
* [`addDocumentSnapshotListener(...)`](#adddocumentsnapshotlistener)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### signInWithCustomToken(...)

```typescript
signInWithCustomToken(options: CustomToken) => Promise<void>
```

| Param         | Type                                                |
| ------------- | --------------------------------------------------- |
| **`options`** | <code><a href="#customtoken">CustomToken</a></code> |

--------------------


### addDocumentSnapshotListener(...)

```typescript
addDocumentSnapshotListener<T>(options: DocumnentReference, callback: DocumentSnapshotCallback<T>) => Promise<CallbackID>
```

| Param          | Type                                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| **`options`**  | <code><a href="#documnentreference">DocumnentReference</a></code>                      |
| **`callback`** | <code><a href="#documentsnapshotcallback">DocumentSnapshotCallback</a>&lt;T&gt;</code> |

**Returns:** <code>Promise&lt;string&gt;</code>

--------------------


### Interfaces


#### CustomToken

| Prop        | Type                |
| ----------- | ------------------- |
| **`token`** | <code>string</code> |


#### DocumnentReference

| Prop            | Type                |
| --------------- | ------------------- |
| **`reference`** | <code>string</code> |


#### DocumentSnapshot

| Prop       | Type                | Description                                                       | Since |
| ---------- | ------------------- | ----------------------------------------------------------------- | ----- |
| **`id`**   | <code>string</code> | The id of the document.                                           | 1.0.0 |
| **`data`** | <code>T</code>      | The fields of the document or null if the document doesn't exist. | 1.0.0 |


### Type Aliases


#### DocumentSnapshotCallback

<code>(data: <a href="#documentsnapshot">DocumentSnapshot</a>&lt;T&gt; | null, err?: any): void</code>


#### CallbackID

<code>string</code>

</docgen-api>
