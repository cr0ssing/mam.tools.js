const log = require('../lib/logger').log

const clients = {};

const init = async (iota, seed) => {
    log.debug("Initializing a mocked mam client. No iota node will be used.")
    let client = undefined
    if (!clients[seed]) {
        client = {
            seed: seed,
            channel: {
                mode: 'empty'
            },
            channels: {
                restricted: {}
            }
        }
    } else {
        client = clients[seed]
    }
    return changeMode(client, 'public', null)
};

const changeMode = (client, mode, sideKey) => {
    const currentMode = client.channel.mode
    const seed = client.seed
    if (currentMode != mode) {
        //save current channel
        if (currentMode == 'restricted') {
            const currentSideKey = client.channel.side_key
            client.channels.restricted[currentSideKey] = client.channel
        } else if (currentMode != 'empty') {
            client.channels[currentMode] = client.channel
        }
        if ((mode == 'restricted' && client.channels.restricted[sideKey]) 
            || (mode != 'restricted' && client.channels[mode])) {
            //channel already present
            client.channel = mode == 'restricted' ? client.channels.restricted[sideKey] : client.channels[mode]
        } else {
            //not present. create new
            const channel = {
                start: 0,
                mode: mode,
                side_key: sideKey,
                addresses: []
            }
            client.channel = channel
            
            if (mode != 'restricted') {
                client.channels[mode] = channel
            } else {
                client.channels.restricted[sideKey] = channel
            }
        }
    }
    clients[seed] = client
    return clients[seed]
};

const addresses = {}

const create = (mam, trytes) => {
    let last = mam.channel.addresses.length == 0 ? undefined : mam.channel.addresses[mam.channel.addresses.length - 1]
    while (mam.channel.addresses.length <= mam.channel.start + 1) {
        const address = generateRandomTrytes()
        const n = {
            root: mam.channel.mode == 'public' ? address : generateRandomTrytes(),
            address: address,
            mode: mam.channel.mode,
            sideKey: mam.channel.side_key
        }
        mam.channel.addresses.push(n)
        if (last) {
            last.next = n.address
        }
        addresses[n.address] = n
        last = n
    }
    const result = mam.channel.addresses[mam.channel.start]
    mam.channel.start++
    return {
        state: mam,
        address: result.address,
        root: result.root,
        payload: trytes
    }
};

const generateRandomTrytes = (length = 81) => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9";
    let retVal = [81];
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal[i] = charset.charAt(Math.floor(Math.random() * n));
    }
    let result = retVal.join("")
    return result;
};

const messages = {};

const fetch = async (r, mode, sideKey) => {
    let m = messages[r]
    if (!m) {
        throw "No messages"
    }
    if (mode != m.mode || (mode == 'restricted' && m.sideKey != sideKey)) {
        throw "Could not decode messages"
    }
    const result = {
        messages: [],
        nextRoot: ''
    }
    while (m) {
        result.messages.push(m.payload)
        result.nextRoot = m.nextRoot
        m = messages[m.nextRoot]
    }
    return result
};

const attach = async (payload, address) => {
    const r = addresses[address]
    const message = {
        payload: payload,
        address: address,
        root: r.root,
        nextRoot: addresses[r.next].root,
        mode: r.mode,
        sideKey: r.sideKey
    }
    messages[message.root] = message
};

module.exports = {
    init: init,
    changeMode: changeMode,
    create: create,
    fetch: fetch,
    attach: attach
}