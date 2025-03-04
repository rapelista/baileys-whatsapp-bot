const Help = {
    name: "help",
    description: "menampilkan commands",
    alias: ["help", "h"],
    async execute(sock, messages, commands, senderNumber, text, quotedPesan, client, database) {
        var help = ""
        var ada = false
        if (text.split(" ").length >= 2) {
            let command = text.split(" ")[1]
            commands.forEach(async c => {
                if (c.alias.includes(command)) {
                    help = `*command*: ${c.name}\n*alias*: ${c.alias.join(", ")}\n*deskripsi*: ${c.description}`
                    ada = true
                }
            })
            if (!ada) commands.get("reaction").execute(sock, messages, false)
        }
        else if (text.split(" ").length == 1){
            help = messages[0].key.participant == undefined
                ? `/echo *text*
/getcontact *nomor*
/help
/help *command*
/kbbi *kata*
/sticker *judul pembuat*
/note
/note add *subjek isi*
/note remove *subjek*
?<text to chat>\n
*NB**
Nomor pengirim = @me, @myself, @aku, @saya\n
*judul* dan *pembuat* boleh kosong`
                : `/all
/echo *text*
/getcontact *nomor*
/help
/help *command*
/kbbi *kata*
/note
/note add *subjek isi*
/note remove *subjek*
/sticker *judul pembuat*
/tag
/tag add *inisial @.. @..*
/tag edit *inisial_lama inisial_baru*
/tag remove *inisial*
/tag *inisial*
/tag *inisial add @.. @..*
/tag *inisial remove @.. @..*
*#inisial*
?<text to chat>\n
Anonim chat buka: cutt.ly/anonim-chat\n
*NB**
Nomor pengirim = @me, @myself, @aku, @saya\n
*judul* dan *pembuat* boleh kosong`
        
        }
        await sock.sendMessage(
            senderNumber,
            {text: help},
            {quoted: messages[0]},
            1000
        );
    }
}

export default Help