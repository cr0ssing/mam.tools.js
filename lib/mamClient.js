const IOTA = require('iota.lib.js')
let Mam = require('mam.client.js')
const debug = require('debug')('mam')
const log = require('./logger').log

let provider = undefined;

/**
 * A MAM lib for node.js
 * @exports mamClient
 * @typicalname mam
 * @example
 * const mam = require('mam.tools.js')
 */
const mam = {}

/**
 * Sets the node to use for all requests to the tangle. The given node must
 * support pow.
 * @param {string} url the url of the node to use.
 */
mam.setProvider = (url) => {provider = url};

/**
 * Creates an Object to handle requests to the tangle. An optional url to a node can 
 * be given, by default the url set by setProvider is used.
 * 
 * @param {string} [url = provider] the url of the node to use. Default is the url set
 * by setProvider.
 * @returns {IotaClass} the newly created iota object.
 */
mam.getIota = (url = provider) => {
    const iota = new IOTA({
        provider: url
    });
    debug(`Using node ${iota.provider}`)
    return iota
};

 /**
  * Initializes a {@link module:types.MAMClient} from given parameters. The default uses a 
  * randomly generated seed with a iota using the node set by setProvider to access a public
  * MAM channel. The state is initialized in a way, that the next message will 
  * be attached to the next root of the channel even if messages are already existent
  * in the channel.
  * 
  * @async
  * @param {Object} [params] an Object containing seed, iota client, MAM channel mode, 
  *     and a sideKey if mode is 'restricted'.
  * @param {string} [params.seed = generateSeed()] The seed for the MAM channels.
  * @param {IotaClass} [params.iota = getIota()] The iota client for communication with a full node.
  * @param {string} [params.mode = 'public'] the mode of the MAM channel to read/write. 
  *     'public', 'restricted' and 'private' are valid.
  * @param {string} [params.sideKey = null] the side key when using a restricted channel.
  * @return {Promise.<MAMClient>} a Promise awaiting an object containing the MAM state object, 
  *     the iota client and the root address of the channel.
  */
mam.createMamFrom = async ({seed: seed = mam.generateSeed(), iota: iota = mam.getIota(), mode: mode = "public", sideKey: sideKey = null} = {}) => {
    return mam.createMam(seed, iota, mode, sideKey)
};

 /**
  * Initializes a {@link module:types.MAMClient} from given parameters. The default uses a 
  * randomly generated seed with a iota using the node set by setProvider to access a public
  * MAM channel. The state is initialized in a way, that the next message will 
  * be attached to the next root of the channel even if messages are already existent
  * in the channel.
  * 
  * @async
  * @param {string} [seed = generateSeed()] The seed for the MAM channels.
  * @param {IotaClass} [iota = getIota()] The iota client for communication with a full node.
  * @param {string} [mode = 'public'] the mode of the MAM channel to read/write. 
  *     'public', 'restricted' and 'private' are valid.
  * @param {string} [sideKey = null] the side key when using a restricted channel.
  * @return {Promise.<MAMClient>} a Promise awaiting an object containing the MAM state object, 
  *     the iota client and the root address of the channel.
  */
mam.createMam = async (seed = mam.generateSeed(), iota = mam.getIota(), mode = "public", sideKey = null) => {
    let mam = await Mam.init(iota, seed)
    const state = await changeMode(mam, mode, sideKey)
    return {
        iota: iota,
        mam: state.mam,
        channelRoot: state.channelRoot
    }
};

/**
 * Changes the mode of a given mam state object. The state is initialized in a way, 
 * that the next message will be attached to the next root of the channel even if 
 * messages are already existent in the channel.
 * 
 * @async
 * @param {Object} mam The mam state object whose mode should be changed.
 * @param {string} mode the mode of the MAM channel to read/write. 
  *     'public', 'restricted' and 'private' are valid.
  * @param {string} [sideKey=null] the side key when using a restricted channel.
  * @return {Promise.<ChangeModeState>} a Promise awaiting an object containing the mam state 
  * with changed mode and the channel root address of the channel in the new mode.
 */
mam.changeMode = changeMode;

async function changeMode(mam, mode, sideKey = null) {
    if (mode != mam.channel.mode) {
        debug("Changing mode to '%s'", mode)
        mam = Mam.changeMode(mam, mode, sideKey)
    } 
    mam.channel.start = 0
    const mamRoot = getRoot(mam)
    debug(`Initialize mode '${mode}'. Reading messages existing on the channel...`)
    let resp = await getMessages(mamRoot, mode, sideKey)
    mam.channel.start = resp.messages.length //needs to be set to add new messages correctly
    return {
        channelRoot: mamRoot,
        mam: mam
    }
}

/**
 * @param {Object} mam the MAM state.
 * @return {string} the root address of the channels next message.
 */
mam.getRoot = getRoot;

function getRoot(mam) {
    const r = Mam.create(mam, '').root
    mam.channel.start--;
    return r
};

/**
 * Retrieves all messages starting from the given channel root using mode and 
 * sideKey given by the given mamState Object.
 * 
 * @async
 * @param {string} channelRoot the root address of the first message in the 
 *      channel that should be retrieved.
 * @param {Object} mamState the initialized MAM state object.
 * @return {Promise.<MessageResponse>} a Promise awaiting an Object containing 
 *      the messages retrieved from the MAM channel and the next channel root.
 */
mam.getChannelMessages = async (channelRoot, mamState) => {
    return getMessages(channelRoot, mamState.channel.mode, mamState.channel.side_key)
}

/**
 * Retrieves all messages starting from the given channel root using given mode and 
 * sideKey.
 * 
 * @async
 * @param {string} channelRoot the root address of the first message in the 
 *      channel that should be retrieved.
 * @param {string} [mode='public'] the mode of the retrieved channel.
 * @param {string} [sideKey=null] the sideKey of retrieved restricted channel.
 * @return {Promise.<MessageResponse>} a Promise awaiting an Object containing 
 *      the messages retrieved from the MAM channel and the next channel root.
 */
mam.getMessages = getMessages;

async function getMessages(mamRoot, mode = 'public', sideKey = null) {
    try {
        let result = await Mam.fetch(mamRoot, mode, sideKey)
        return result
    } catch (err) { //if no messages are in the channel exception is thrown
        return {
            messages: [],
            nextRoot: mamRoot
        }
    }
};

/**
 * @param {string} [length=81] the wanted length of the generated seed.
 * @return {string} a randomly generated seed with the given length.
 */
mam.generateSeed = (length = 81) => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9";
    let retVal = [81];
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal[i] = charset.charAt(Math.floor(Math.random() * n));
    }
    let result = retVal.join("")
    return result;
};

/**
 * Publishes a given text to a MAM channel using the initialized MAM state Object.
 * 
 * @asnyc
 * @param {string} text the text to publish to the tangle.
 * @param {Object} mamState the MAM state Object.
 * @param {IotaClass} iota the initialized iota client.
 * @param {boolean} [toTrytes=true] whether to convert the text to trytes.
 * @return {Promise.<PublishResponse>} a Promise containing an Object conaining 
 *      the root and the address of the published message and the updated MAM State Object.
 */
mam.publish = async (text, mamState, iota, toTrytes = true) => {
    const payload = toTrytes ? iota.utils.toTrytes(text) : text
    debug('Trytes: %s', payload)
    // Create MAM Payload - STRING OF TRYTES
    const message = Mam.create(mamState, payload)
    // Save new mamState
    mamState = message.state
    // Attach the payload.
    debug("Address: %s", message.address)
    if (message.address != message.root) { //if mode==public -> root==address
        debug("Root: %s", message.root)
    }
    const r = await Mam.attach(message.payload, message.address)
    if (r instanceof Error) {
        throw r
    }
    log.info('Attached message')
    return {
        root: message.root,
        address: message.address,
        mamState: mamState
    }
};

module.exports = mam;