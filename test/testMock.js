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
        await mamClient.publish("Test", client.mam, client.iota)
        await mamClient.createMam()
        await mamClient.publish("Zweiter Test", client.mam, client.iota)
        const client2 = await mamClient.createMam(client.mam.seed, null, 'private')
        const r = await mamClient.getMessages(client2.channelRoot, 'private')
        console.log("Messages:", r.messages)
        expect(r.messages).to.deep.equal(["Test", "Zweiter Test"])
    })

    it("should return constant root as long as no messages are attached", async () => {
        const client = await mamClient.createMamFrom()
        const r = mamClient.getRoot(client.mam)
        //next root of channel should be the same as long as no new message was published
        expect(mamClient.getRoot(client.mam)).to.equal(r)
        await mamClient.publish("Test", client.mam, client.iota)
        expect(mamClient.getRoot(client.mam)).to.not.equal(r)
    })
})