const { listMessageSend, sendMessageTemplate } = require('../sendReplyApi/whatsAppApi')
const { cityList } = require('../boonggApi/AxiosCall');



const cityListRow = async () => {

    let cities = await cityList()
    let row = cities.data.map((city, index) => {
        return ({ id: city._id + '', title: city.name })
    })
    return row
}

const textReply = async (messages) => {

    try {
        console.log("text message", messages[0])

        const { text, from } = messages[0]

        let msg_body = text.body;
        console.log(msg_body)

        const validMessages = ['test', "hello"]
        if (validMessages.includes(msg_body.trim().toLowerCase())) {

            let row = await cityListRow()
            
            // City List map
            const desiredOrder = ['5a66ffb063954132dfc0d568', '638f624843b8c905460a0ef1', '63c2d37f5b14bb50e58b14aa', '5ef0db450b21001b0911a129', '5ef399cb17b98b6b50426cf1', '5efb383217b98b6b50426dfc', '5cf1134946bae666ea47bfd3', '5c24db5e0d3df820ceb7ddcf', '5f292dbd21edb12e946534de', '5ef772ce17b98b6b50426dc9', '5ef39a9017b98b6b50426cf2', '5ef7744017b98b6b50426dcd', '5ef6e08917b98b6b50426da7', '63a2011b1461fb218a65882b', '63a2014b60b4805bbffebdb5'];
            row = row.sort((a, b) => desiredOrder.indexOf(a.id) - desiredOrder.indexOf(b.id));
            
            // console.log(row)
            
            await sendMessageTemplate('welcome', from)

            let listNumber = 1
            for (let i = 0; i < row.length;) {

                const listInteractiveObject = {
                    type: "list",

                    body: {
                        text: "To start, please select your City :",
                    },
                    action: {
                        button: "City List No - " + listNumber,
                        sections: [
                            {
                                title: 'Choose Your City',
                                rows: row.slice(i, i + 10)
                            },
                        ],
                    },

                };

                let messageObject = {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: from,
                    type: "interactive",
                    interactive: listInteractiveObject,
                };

                setTimeout(() => listMessageSend(messageObject), listNumber * 100);

                i = i + 10
                listNumber++
                if (i >= row.length) {
                    i = row.length
                }
            }
        }
        else {

            await sendMessageTemplate('welcome', from)
            // City List map

            let row = await cityListRow()
            // console.log(row)

            const desiredOrder = ['5a66ffb063954132dfc0d568', '638f624843b8c905460a0ef1', '63c2d37f5b14bb50e58b14aa', '5ef0db450b21001b0911a129', '5ef399cb17b98b6b50426cf1', '5efb383217b98b6b50426dfc', '5cf1134946bae666ea47bfd3', '5c24db5e0d3df820ceb7ddcf', '5f292dbd21edb12e946534de', '5ef772ce17b98b6b50426dc9', '5ef39a9017b98b6b50426cf2', '5ef7744017b98b6b50426dcd', '5ef6e08917b98b6b50426da7', '63a2011b1461fb218a65882b', '63a2014b60b4805bbffebdb5'];
            row = row.sort((a, b) => desiredOrder.indexOf(a.id) - desiredOrder.indexOf(b.id));

            let listNumber = 1
            for (let i = 0; i < row.length;) {

                const listInteractiveObject = {
                    type: "list",

                    body: {
                        text: "To start, please select your City :",
                    },
                    action: {
                        button: "City List No - " + listNumber,
                        sections: [
                            {
                                title: 'Choose Your City',
                                rows: row.slice(i, i + 10)
                            },
                        ],
                    },

                };

                let messageObject = {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: from,
                    type: "interactive",
                    interactive: listInteractiveObject,
                };

                setTimeout(() => listMessageSend(messageObject), listNumber * 1000);

                i = i + 10
                listNumber++
                if (i >= row.length) {
                    i = row.length
                }
            }

        }
    } catch (err) {

    }
}

module.exports = { textReply }