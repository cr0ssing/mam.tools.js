#!/usr/bin/env node

const {log, setTimestamp} = require('./logger');
setTimestamp(false);
const mamClient = require("./mamClient");

(async () => {
    try {
        var args = require('minimist')(process.argv.slice(2))
        const command = args._[0]
        delete args._
        args.command = command
        if (args.toTrytes) {
            args.toTrytes = (args.toTrytes === 'true')
        }
        if (args.readMessages == 'false') {
            args.readMessages = false
        }
        log.info("Parameters given:\n%o", args)
        if (args.provider) {
            mamClient.setProvider(args.provider)
            args.iota = mamClient.getIota()
        } else {
            log.error("Provider node URL must be given to use cli.")
            return;
        }
        
        if (command == 'readChannel') {
            let channelRoot = args.channelRoot
            let mode = args.mode || 'public'
            let sideKey = args.sideKey || null
            if (!channelRoot && !args.seed) {
                args.seed = mamClient.generateSeed()
                log.info("Generated random seed: %s", args.seed)
            }
            if (args.seed) {
                const client = await mamClient.createMamFrom(args)
                channelRoot = client.channelRoot
                mode = client.mam.channel.mode
                sideKey = client.mam.channel.side_key
                log.info("Channel root: %s", channelRoot)
            } else {
                //this is necessary to set iota in Mam lib
                await mamClient.createMamFrom({iota: args.iota, mode: mode, sideKey: sideKey})
            }
            if (channelRoot) {
                await readMessages(channelRoot, mode, sideKey, args.iota)
                return;
            } else {
                log.error("Seed or channel root must be given to get channel info")
                return;
            }
        }
        if (command == 'publish') {
            if (args.seed) {
                const client = await mamClient.createMamFrom(args)
                log.info("Channel root: %s", client.channelRoot)
                if (args.content) {
                    log.info("Publishing message...")
                    const result = await mamClient.publish(args.content, client.mam, args.iota, args.toTrytes)
                    log.info("Message root: %s", result.root)
                    log.info("Message address: %s", result.address)
                    if (args.readMessages) {
                        await readMessages(client.channelRoot, client.mam.channel.mode, client.mam.channel.side_key, args.iota)
                    }
                    return;
                } else {
                    log.error("No content was set to write to the tangle.")
                    return;
                }
            } else {
                log.error("Seed must be given to publish message")
                return;
            }
        }
        log.error("Command unknown.")
    } catch(err) {
        log.error(err)
    }
})()

async function readMessages(channelRoot, mode, sideKey, iota) {
    // Fetch Stream Async to Test
    const resp = await mamClient.getMessages(channelRoot, mode, sideKey)
    if (resp.messages.length == 0) {
        log.info("No messages published on the channel.")
    } else {
        log.info("Messages:\n%O", resp.messages.map(m => iota.utils.fromTrytes(m) || m))
    }
    log.info("Next Root: %s", resp.nextRoot)
}