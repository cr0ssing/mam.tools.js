/**
 * The types listed below are used by the mam tools.
 * @module types
 * @typicalname types
 * @alias types
 * @name types
 */
;

/**
 * An object containing the MAM client, root of the MAM channel and the iota client.
 * @typedef {Object} MAMClient
 * @property {IotaClass} iota The iota client.
 * @property {Object} mam The MAM state object used by the client lib for all requests regarding
 * the set channel (by seed and mode).
 * @property {string} channelRoot the root of the channels first message.
 */
;

/**
 * An object containing the changed mamState an the root to the channels first message.
 * @typedef {Object} ChangeModeState
 * @property {Object} mam The changed MAM state object used by the client lib for all requests regarding
 * the set channel (by seed and mode).
 * @property {string} channelRoot the root of the channels first message. 
 */
;

function a() {
    // workaround that types doesn't appear twice in readme
}

/**
 * An Object conaining the root and the address of the published message and the given
 * MAM State Object.
 * @typedef {Object} PublishResponse
 * @property {string} root the root of the published message.
 * @property {string} address the address of the published message.
 * @property {Object} mamState the updated MAM state Object.
 */
;

function a() {
    // workaround that types doesn't appear twice in readme
}

/**
 * An Object containing the messages retrieved from the MAM channel and the next channel root.
 * @typedef {Object} MessageResponse
 * @property {Array.<string>} messages The messages retrieved from the MAM channel.
 * @property {string} nextRoot the root address of the next message in the mam channel.
 */
;