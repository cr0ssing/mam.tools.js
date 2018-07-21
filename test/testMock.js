const rewire = require("rewire")
const mock = require("./mamMock")
let mamClient = rewire("../lib/mamClient")
mamClient.__set__("Mam", mock)
const expect = require('chai').expect

describe("testing mocked MAM client", async () => {
    it("should publish and read them from another client", async () => {
        const client = await mamClient.createMamFrom({
            mode: 'private'
        })
        await mamClient.publish("Test", client.mam, client.iota, false)
        await mamClient.createMam()
        await mamClient.publish("Zweiter Test", client.mam, client.iota, false)
        const client2 = await mamClient.createMam(client.mam.seed, null, 'private')
        const r = await mamClient.getMessages(client.channelRoot, 'private')
        console.log("Messages:", r.messages)
        expect(r.messages).to.deep.equal(["Test", "Zweiter Test"])
    })
})