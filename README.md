[![npm](https://img.shields.io/npm/v/mam.tools.js.svg)](https://www.npmjs.com/package/mam.tools.js)

# MAM Tools
A library containing tools to make the use of IOTAs Masked Authenticated Messaging more easy.

Included is a lib for node.js, a js module for mocking a MAM client so that no real IOTA node is needed for the testing
of MAM apps and a CLI.

## CLI
You can use all functions of the MAM library with a simple CLI. The releases contain binaries for different platforms with
that you can use MAM standalone from the command line:
```sh
$ mamCli-linux-x86 <command> [options]
```
It's also possible to run the cli directly with node/npm:
```sh
$ npm install
$ npm run cli <command> -- [options]
```
Note the extra '--' needed before the options.

### Setting Node
The option <code>--provider</code> must be set in all commands. It should be set to the URL of an IOTA full node supporting POW.

### Commands: 
#### readChannel    
Reads the content of a given MAM channel and printing information such as the channelRoot.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| channelRoot | <code>string</code> |  | The root of the MAM channel. This is shared with others to read messages of a channel. |
| seed | <code>string</code> |  | The seed of the MAM channel. It's need to publish new messages to a MAM channel. |
| mode | <code>string</code> | 'public' | The mode of the MAM channel. Allowed are 'public', 'private' and 'restricted' |
| sideKey | <code>string</code> | <code>null</code> | The sideKey needed for MAM channels in restricted mode. This is needed to read messages from this channel and to publish new ones. |

Only channelRoot or seed are needed for reading a channel. The CLI will look for the channelRoot first and then for a seed.
If both aren't given a random seed is generated.

**Example**  
```sh
$ mamCli-linux-x86 readChannel --seed=THISISTHESEEDOFTHETICACCOUNTANDISHOULDNOTGIVEITTOANYBODYELSE --provider=https://your.favorite.node
```

#### publish    
Publishes a new message to a specified channel.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| seed | <code>string</code> |  | The seed of the MAM channel. |
| mode | <code>string</code> | 'public' | The mode of the MAM channel. Allowed are 'public', 'private' and 'restricted' |
| sideKey | <code>string</code> | <code>null</code> | The sideKey needed for MAM channels in restricted mode. |
| toTrytes | <code>boolean</code> | true | Whether to convert the given text to trytes. |
| content | <code>string</code> |  | The message to publish. Remember to wrap the content in '' if it contains spaces. |
| readMessages | <code>boolean</code> | false | Whether to read the channel's content after publishing |

**Example**  
```sh
$ mamCli-linux-x86 publish --seed=THISISTHESEEDOFTHETICACCOUNTANDISHOULDNOTGIVEITTOANYBODYELSE --provider=https://your.favorite.node
    -content='Hello World' --readMessages
```
* * *
## API Reference
A MAM lib for node.js

**Example**  
```js
const mam = require('mam.tools.js')
```

* [mamClient](#module_mamClient)
    * [.changeMode](#module_mamClient.changeMode) ⇒ <code>Promise.&lt;ChangeModeState&gt;</code>
    * [.getRoot](#module_mamClient.getRoot) ⇒ <code>string</code>
    * [.getMessages](#module_mamClient.getMessages) ⇒ <code>Promise.&lt;MessageResponse&gt;</code>
    * [.setProvider(url)](#module_mamClient.setProvider)
    * [.getIota([url])](#module_mamClient.getIota) ⇒ <code>IotaClass</code>
    * [.createMamFrom([params])](#module_mamClient.createMamFrom) ⇒ <code>Promise.&lt;MAMClient&gt;</code>
    * [.createMam([seed], [iota], [mode], [sideKey])](#module_mamClient.createMam) ⇒ <code>Promise.&lt;MAMClient&gt;</code>
    * [.getChannelMessages(channelRoot, mamState)](#module_mamClient.getChannelMessages) ⇒ <code>Promise.&lt;MessageResponse&gt;</code>
    * [.generateSeed([length])](#module_mamClient.generateSeed) ⇒ <code>string</code>
    * [.publish(text, mamState, iota, [toTrytes])](#module_mamClient.publish) ⇒ <code>Promise.&lt;PublishResponse&gt;</code>

<a name="module_mamClient.changeMode"></a>

### mam.changeMode ⇒ <code>Promise.&lt;ChangeModeState&gt;</code>
Changes the mode of a given mam state object. The state is initialized in a way, that the next message will be attached to the next root of the channel even if messages are already existent in the channel.

**Kind**: static property of [<code>mamClient</code>](#module_mamClient)  
**Returns**: <code>Promise.&lt;ChangeModeState&gt;</code> - a Promise awaiting an object containing the mam state with changed mode and the channel root address of the channel in the new mode.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| mam | <code>Object</code> |  | The mam state object whose mode should be changed. |
| mode | <code>string</code> |  | the mode of the MAM channel to read/write.      'public', 'restricted' and 'private' are valid. |
| [sideKey] | <code>string</code> | <code>null</code> | the side key when using a restricted channel. |

<a name="module_mamClient.getRoot"></a>

### mam.getRoot ⇒ <code>string</code>
**Kind**: static property of [<code>mamClient</code>](#module_mamClient)  
**Returns**: <code>string</code> - the root address of the channels next message.  

| Param | Type | Description |
| --- | --- | --- |
| mam | <code>Object</code> | the MAM state. |

<a name="module_mamClient.getMessages"></a>

### mam.getMessages ⇒ <code>Promise.&lt;MessageResponse&gt;</code>
Retrieves all messages starting from the given channel root using given mode and sideKey.

**Kind**: static property of [<code>mamClient</code>](#module_mamClient)  
**Returns**: <code>Promise.&lt;MessageResponse&gt;</code> - a Promise awaiting an Object containing      the messages retrieved from the MAM channel and the next channel root.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| channelRoot | <code>string</code> |  | the root address of the first message in the       channel that should be retrieved. |
| [mode] | <code>string</code> | <code>&quot;&#x27;public&#x27;&quot;</code> | the mode of the retrieved channel. |
| [sideKey] | <code>string</code> | <code>null</code> | the sideKey of retrieved restricted channel. |

<a name="module_mamClient.setProvider"></a>

### mam.setProvider(url)
Sets the node to use for all requests to the tangle. The given node mustsupport pow.

**Kind**: static method of [<code>mamClient</code>](#module_mamClient)  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | the url of the node to use. |

<a name="module_mamClient.getIota"></a>

### mam.getIota([url]) ⇒ <code>IotaClass</code>
Creates an Object to handle requests to the tangle. An optional url to a node can be given, by default the url set by setProvider is used.

**Kind**: static method of [<code>mamClient</code>](#module_mamClient)  
**Returns**: <code>IotaClass</code> - the newly created iota object.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [url] | <code>string</code> | <code>&quot;provider&quot;</code> | the url of the node to use. Default is the url set by setProvider. |

<a name="module_mamClient.createMamFrom"></a>

### mam.createMamFrom([params]) ⇒ <code>Promise.&lt;MAMClient&gt;</code>
Initializes a [module:types.MAMClient](module:types.MAMClient) from given parameters. The default uses a randomly generated seed with a iota using the node set by setProvider to access a publicMAM channel. The state is initialized in a way, that the next message will be attached to the next root of the channel even if messages are already existentin the channel.

**Kind**: static method of [<code>mamClient</code>](#module_mamClient)  
**Returns**: <code>Promise.&lt;MAMClient&gt;</code> - a Promise awaiting an object containing the MAM state object,     the iota client and the root address of the channel.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [params] | <code>Object</code> |  | an Object containing seed, iota client, MAM channel mode,      and a sideKey if mode is 'restricted'. |
| [params.seed] | <code>string</code> | <code>&quot;generateSeed()&quot;</code> | The seed for the MAM channels. |
| [params.iota] | <code>IotaClass</code> | <code>getIota()</code> | The iota client for communication with a full node. |
| [params.mode] | <code>string</code> | <code>&quot;&#x27;public&#x27;&quot;</code> | the mode of the MAM channel to read/write.      'public', 'restricted' and 'private' are valid. |
| [params.sideKey] | <code>string</code> | <code>null</code> | the side key when using a restricted channel. |

<a name="module_mamClient.createMam"></a>

### mam.createMam([seed], [iota], [mode], [sideKey]) ⇒ <code>Promise.&lt;MAMClient&gt;</code>
Initializes a [module:types.MAMClient](module:types.MAMClient) from given parameters. The default uses a randomly generated seed with a iota using the node set by setProvider to access a publicMAM channel. The state is initialized in a way, that the next message will be attached to the next root of the channel even if messages are already existentin the channel.

**Kind**: static method of [<code>mamClient</code>](#module_mamClient)  
**Returns**: <code>Promise.&lt;MAMClient&gt;</code> - a Promise awaiting an object containing the MAM state object,     the iota client and the root address of the channel.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [seed] | <code>string</code> | <code>&quot;generateSeed()&quot;</code> | The seed for the MAM channels. |
| [iota] | <code>IotaClass</code> | <code>getIota()</code> | The iota client for communication with a full node. |
| [mode] | <code>string</code> | <code>&quot;&#x27;public&#x27;&quot;</code> | the mode of the MAM channel to read/write.      'public', 'restricted' and 'private' are valid. |
| [sideKey] | <code>string</code> | <code>null</code> | the side key when using a restricted channel. |

<a name="module_mamClient.getChannelMessages"></a>

### mam.getChannelMessages(channelRoot, mamState) ⇒ <code>Promise.&lt;MessageResponse&gt;</code>
Retrieves all messages starting from the given channel root using mode and sideKey given by the given mamState Object.

**Kind**: static method of [<code>mamClient</code>](#module_mamClient)  
**Returns**: <code>Promise.&lt;MessageResponse&gt;</code> - a Promise awaiting an Object containing      the messages retrieved from the MAM channel and the next channel root.  

| Param | Type | Description |
| --- | --- | --- |
| channelRoot | <code>string</code> | the root address of the first message in the       channel that should be retrieved. |
| mamState | <code>Object</code> | the initialized MAM state object. |

<a name="module_mamClient.generateSeed"></a>

### mam.generateSeed([length]) ⇒ <code>string</code>
**Kind**: static method of [<code>mamClient</code>](#module_mamClient)  
**Returns**: <code>string</code> - a randomly generated seed with the given length.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [length] | <code>string</code> | <code>81</code> | the wanted length of the generated seed. |

<a name="module_mamClient.publish"></a>

### mam.publish(text, mamState, iota, [toTrytes]) ⇒ <code>Promise.&lt;PublishResponse&gt;</code>
Publishes a given text to a MAM channel using the initialized MAM state Object.

**Kind**: static method of [<code>mamClient</code>](#module_mamClient)  
**Returns**: <code>Promise.&lt;PublishResponse&gt;</code> - a Promise containing an Object conaining      the root and the address of the published message and the updated MAM State Object.  
**Asnyc**:   

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| text | <code>string</code> |  | the text to publish to the tangle. |
| mamState | <code>Object</code> |  | the MAM state Object. |
| iota | <code>IotaClass</code> |  | the initialized iota client. |
| [toTrytes] | <code>boolean</code> | <code>true</code> | whether to convert the text to trytes. |

* * *
## Types
The types listed below are used by the mam tools.


* [types](#module_types)
    * [~MAMClient](#module_types..MAMClient) : <code>Object</code>
    * [~ChangeModeState](#module_types..ChangeModeState) : <code>Object</code>
    * [~PublishResponse](#module_types..PublishResponse) : <code>Object</code>
    * [~MessageResponse](#module_types..MessageResponse) : <code>Object</code>

<a name="module_types..MAMClient"></a>

### types~MAMClient : <code>Object</code>
An object containing the MAM client, root of the MAM channel and the iota client.

**Kind**: inner typedef of [<code>types</code>](#module_types)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| iota | <code>IotaClass</code> | The iota client. |
| mam | <code>Object</code> | The MAM state object used by the client lib for all requests regarding the set channel (by seed and mode). |
| channelRoot | <code>string</code> | the root of the channels first message. |

<a name="module_types..ChangeModeState"></a>

### types~ChangeModeState : <code>Object</code>
An object containing the changed mamState an the root to the channels first message.

**Kind**: inner typedef of [<code>types</code>](#module_types)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| mam | <code>Object</code> | The changed MAM state object used by the client lib for all requests regarding the set channel (by seed and mode). |
| channelRoot | <code>string</code> | the root of the channels first message. |

<a name="module_types..PublishResponse"></a>

### types~PublishResponse : <code>Object</code>
An Object conaining the root and the address of the published message and the givenMAM State Object.

**Kind**: inner typedef of [<code>types</code>](#module_types)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| root | <code>string</code> | the root of the published message. |
| address | <code>string</code> | the address of the published message. |
| mamState | <code>Object</code> | the updated MAM state Object. |

<a name="module_types..MessageResponse"></a>

### types~MessageResponse : <code>Object</code>
An Object containing the messages retrieved from the MAM channel and the next channel root.

**Kind**: inner typedef of [<code>types</code>](#module_types)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| messages | <code>Array.&lt;string&gt;</code> | The messages retrieved from the MAM channel. |
| nextRoot | <code>string</code> | the root address of the next message in the mam channel. |

* * *

&copy; 2018 Robin Lamberti \<lamberti.robin@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
