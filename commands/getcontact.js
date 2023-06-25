require('dotenv').config()
const UripGetContact = require('urip-getcontact');
const getContact = new UripGetContact(process.env.gcToken, process.env.gcKey);
``
module.exports = {
    name: "getcontact",
    description: "API getcontact",
    alias: ["getcontact", "gc"],
    async execute(sock, messages, commands, senderNumber, text, quotedPesan) {
        if (text.split(" ").length >= 2) {
            let nomorTmp = text.split(" ").splice(1).join(" ")
            let nomor = ""
            for (i of nomorTmp) {
                if ((/\d/g).test(i)) {
                    nomor += `${i}`
                }
            }
            if (!nomor.startsWith("0")) {
                nomor = `+${nomor}`
            }
            getContact
                .checkNumber(nomor)
                .then(async (data) => {
                    let msg = ""
                    data.tags.forEach((e) => {
                        msg += e + "\n"
                    })
                    while (true) {
                        if (msg.endsWith("\n"))
                            msg = msg.slice(0, msg.length - 1)
                        else break
                    }
                    await sock.sendMessage(
                        senderNumber,
                        { text: msg },
                        { quoted: messages[0] },
                        1000
                    );
                })
                .catch(async (err) => {
                    await sock.sendMessage(
                        senderNumber,
                        { text: err },
                        { quoted: messages[0] },
                        1000
                    );
                })
        }
        else {
            commands.get("reaction").execute(sock, messages, false)
        }
    }
}