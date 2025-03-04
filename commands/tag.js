import fs from "fs"

const Tag = {
    name: "tag",
    description: "menampilkan tags",
    alias: ["tag", "t"],
    async execute(sock, messages, commands, senderNumber, text, quotedPesan, client, database) {
        const tagsCommand = new Map();
        const files = fs.readdirSync(`./commands/tags`).filter(file => file.endsWith('.js'))
        for (const file of files) {
            const { default: command} = await import(`./tags/${file}`)
            tagsCommand.set(command.name, command)
        }

        const isMessageFromGroup = senderNumber.includes("@g.us");
        if (isMessageFromGroup) {
            const grup = await sock.groupMetadata(senderNumber)
            const coll_tag = database.collection("tag")

            const tags = await coll_tag.findOne({"title": grup.id}).then(async (result) => {
                if (!result) {
                    const data = {
                        title: grup.id,
                        roles: []
                    }
                    await coll_tag.insertOne(data)
                }
                
                // Cek apakah pada role terdapat tag "all"
                return await coll_tag.findOne({"title": grup.id}).then(async (result) => {
                    if (!result.roles.find(roles => roles.name == "all")) {
                        const jids = []
                        grup["participants"].map(usr => {
                            if (!usr.id.includes(process.env.nomor)) {
                                jids.push(usr.id.replace("c.us", "s.whatsapp.net"))
                            }
                        })
                        const data = {
                            $push: {
                                "roles": {
                                    name: "all",
                                    jids: jids,
                                    msg: jids.map(val => `@${val.split("@")[0]}`).join(" ")
                                }
                            }
                        }
                        await coll_tag.updateOne({"title": result.title}, data)
                    }
                    return await coll_tag.findOne({"title": grup.id})
                })
            })

            if (text.split(' ').length == 1) {
                const msg = tags.roles.length <= 0
                          ? "belum ada tag yang ditambahkan"
                          : tags.roles.map(role => role.name).join("\n")
                await sock.sendMessage(
                    senderNumber,
                    {text: msg},
                    {quoted: messages[0]},
                    1000
                );
            }
            else if (text.toLowerCase().split(' ')[1] == 'add') {
                tagsCommand.get('add_inisial').execute(...arguments, coll_tag, tags, grup)
            }
            else if (text.toLowerCase().split(' ')[1] == 'edit') {
                tagsCommand.get('edit_inisial').execute(...arguments, coll_tag, tags)
            }
            else if (text.toLowerCase().split(' ')[1] == 'remove' || text.toLowerCase().split(' ')[1] == 'del') {
                tagsCommand.get('remove_inisial').execute(...arguments, coll_tag, tags)
            }
            else if(tags.roles.find(roles => roles.name == text.split(' ')[1])) {
                tagsCommand.get('inisial').execute(...arguments, tagsCommand, coll_tag, tags, grup)
            }
        } 
        else {
            await sock.sendMessage(
                senderNumber,
                { text: `Anda tidak sedang berada di grup`},
                { quoted: messages[0] },
                1000
            );
        }
    },
}

export default Tag