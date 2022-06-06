# @proteansoftware/capacitor-firestore

Capacitor Plugin for Native Firestore

## Install

```bash
npm install @proteansoftware/capacitor-firestore
npx cap sync
```

## API

<docgen-index>

* [`addDocumentSnapshotListener(...)`](#adddocumentsnapshotlistener)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### addDocumentSnapshotListener(...)

```typescript
addDocumentSnapshotListener<T>(options: DocumnentReference, callback: DocumentSnapshot<T>) => Promise<CallbackID>
```

| Param          | Type                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| **`options`**  | <code><a href="#documnentreference">DocumnentReference</a></code>      |
| **`callback`** | <code><a href="#documentsnapshot">DocumentSnapshot</a>&lt;T&gt;</code> |

**Returns:** <code>Promise&lt;string&gt;</code>

--------------------


### Interfaces


#### DocumnentReference

| Prop            | Type                |
| --------------- | ------------------- |
| **`reference`** | <code>string</code> |


### Type Aliases


#### DocumentSnapshot

<code>(data: T | null, err?: any): void</code>


#### CallbackID

<code>string</code>

</docgen-api>
