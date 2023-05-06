const axios = require('axios')
 
const sendMessageTemplate = async (templateName, from, component) => {

    try {

        if (component == undefined) {
            return await axios.post(`https://graph.facebook.com/v16.0/${process.env.WHATSAPP_PHONEID}/messages`,

                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: from,
                    type: 'template',
                    template: {
                        name: templateName,
                        language: {
                            code: 'en'
                        },
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                })
        } else {
            return await axios.post(`https://graph.facebook.com/v16.0/${process.env.WHATSAPP_PHONEID}/messages`,

                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: from,
                    type: 'template',
                    template: {
                        name: templateName,
                        language: {
                            code: 'en'
                        },
                        components: component
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                })
        }

    } catch (err) {
        console.log("template msg error=", err.message)
    }
}

const listMessageSend = async (messageObject) => {
    try {

        return await axios.post(
            `https://graph.facebook.com/v16.0/${process.env.WHATSAPP_PHONEID}/messages`,
            messageObject,
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                },
            }
        )


    } catch (err) {
        console.log("list message error=", err.message)
    }
}

const textMessage = async (msg_body, from) => {

    try {

        return await axios.post(
            `https://graph.facebook.com/v16.0/${process.env.WHATSAPP_PHONEID}/messages`,

            {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": from,
                "type": "text",
                "text": {
                    "preview_url": false,
                    "body": msg_body
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                },
            }
        )


    } catch (err) {
        console.log(err.message)
    }
}

module.exports = { listMessageSend, sendMessageTemplate, textMessage }