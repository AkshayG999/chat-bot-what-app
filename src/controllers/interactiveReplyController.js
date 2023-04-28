const WhatsAppSession = require('../models/whatsAppSchema')
const { listMessageSend, sendMessageTemplate, textMessage } = require('../sendReplyApi/whatsAppApi')
const { cityList, locality, getWebUser, getStoreUser } = require('../boonggApi/AxiosCall');
const { uploadWhatsAppDocument } = require('../sendReplyApi/uploadDoc')
const { startTimer, stopTimer } = require('../timerReply/timerReply')

const cityListRow = async () => {

    let cities = await cityList()
    let row = cities.data.map((city, index) => {
        return ({ id: city._id + '', title: city.name })
    })
    return row
}


const interactiveReply = async (messages) => {

    try {

        const { interactive, from } = messages[0]
        console.log(interactive)

        let row = await cityListRow()

        if (row.some((city) => city.title == interactive.list_reply.title)) {
            console.log("user select city to get location= ", interactive.list_reply.title)
            stopTimer()

            let city = {
                id: interactive.list_reply.id,
                title: interactive.list_reply.title
            }

            const findUser = await WhatsAppSession.findOne({ mobileNumber: from.slice(2, 12) })
            if (!findUser) {
                await WhatsAppSession.create({ mobileNumber: from.slice(2, 12), cityReply: [city] })

            } else {
                await WhatsAppSession.findOneAndUpdate({ mobileNumber: from.slice(2, 12) }, { cityReply: [city] }, { new: true })

            }


            const storeList = await getStoreUser("", interactive.list_reply.id)


            if (storeList.length == 0) {
                await textMessage("We understand your interest in our Boongg renting service, but we are still in the process of expanding our coverage, and it is not yet available in your city", from)
                return
            }

            const localityList = await locality(interactive.list_reply.id)
            let row = localityList.data.map((location, index) => {
                // console.log(localityList.data)
                const breakPoint = location.name.indexOf("-")

                // console.log(location.name, breakPoint)

                if (breakPoint > -1) {
                    return ({ id: `${index} ${location._id}`, title: location.name.slice(0, breakPoint), description: location.name.slice(breakPoint + 1) })
                } else {
                    return ({ id: `${index} ${location._id}`, title: location.name })
                }
            })

            // console.log(row)
            let listNumber = 1;
            for (let i = 0; i < row.length;) {

                const listInteractiveObject = {
                    type: "list",

                    body: {
                        text: "Please select your Location :",
                    },
                    action: {
                        button: "Location List - " + listNumber,
                        sections: [
                            {
                                title: 'Choose Your Location',
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

                setTimeout(async () => await listMessageSend(messageObject), listNumber * 1000);

                i = i + 10
                listNumber++
                if (i >= row.length) {
                    i = row.length
                }

            }
            return;

        } else if (interactive.list_reply.id.split(' ')[0] >= 0 && interactive.list_reply.id.split(' ')[0] <= 50) {

            console.log("Location choose by User " + interactive.list_reply.id)
            stopTimer();

            let location = {
                id: interactive.list_reply.id.split(' ')[1],
            }

            if (interactive.list_reply.description) {

                location.title = interactive.list_reply.title + "-" + interactive.list_reply.description
            } else {
                location.title = interactive.list_reply.title

            }

            // add Location reply in DB
            await WhatsAppSession.findOneAndUpdate({ mobileNumber: from.slice(2, 12) }, { locationReply: [location] }, { new: true })

            // User Register or Not In Boongg 
            const userCheck = await getWebUser(from.slice(2, 12))
            // console.log(userCheck)

            if (userCheck.data.length > 0) {

                await sendMessageTemplate('welcome_buttons_with_booking', from)
                return;

            } else {

                await sendMessageTemplate('welcome_buttons_without_mybooking', from)
                return;
            }

        } else if (interactive.list_reply.title == 'Booking Procedure') {
            stopTimer()
            await sendMessageTemplate('booking_procedure_steps', from)

            //------Document send-------
            let guideLine_Upload = await uploadWhatsAppDocument("nodejs.pdf");
            let component_1 = [
                {
                    "type": "header",
                    "parameters": [
                        {
                            "type": "document",
                            "document": {
                                "id": guideLine_Upload.id,
                                "filename": "General Driving Guidelines"
                            }
                        }
                    ]
                },
            ];

            await sendMessageTemplate('driving_guidelines', from, component_1);

            //------Document send-------
            let terms_Upload = await uploadWhatsAppDocument("nodejs.pdf");
            let component_2 = [
                {
                    "type": "header",
                    "parameters": [
                        {
                            "type": "document",
                            "document": {
                                "id": terms_Upload.id,
                                "filename": "Terms and Conditions"
                            }
                        }
                    ]
                },
            ];

            await sendMessageTemplate('terms_and_conditions', from, component_2);
            // setTimeout(async () => { await sendMessageTemplate("last_conclusion_message", from) }, 15000);
            startTimer(from)
            return;


        } else if (interactive.list_reply.title == 'Rescheduling Policy') {
            stopTimer()
            await sendMessageTemplate('rescheduling_policy', from)
            // setTimeout(async () => { await sendMessageTemplate("last_conclusion_message", from) }, 15000);
            startTimer(from)
            return;

        } else if (interactive.list_reply.title == 'Cancellation Policy') {
            stopTimer()
            await sendMessageTemplate('cancellation_policy', from)
            // setTimeout(async () => { await sendMessageTemplate("last_conclusion_message", from) }, 15000);
            startTimer(from)
            return;

        } else if (interactive.list_reply.title == 'Fuel Policy') {
            stopTimer()
            await sendMessageTemplate('fuel_policy', from)
            // setTimeout(async () => { await sendMessageTemplate("last_conclusion_message", from) }, 15000);
            startTimer(from)
            return;

        } else if (interactive.list_reply.title == 'Physical Damage') {
            stopTimer()
            const userChatData = await WhatsAppSession.find({ mobileNumber: from.slice(2, 12) })

            let storeUser = await getStoreUser(userChatData[0].locationReply[0].title)
            console.log(storeUser)

            const component = [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": storeUser[0].mobileNumber
                        },
                    ]
                }
            ]

            await sendMessageTemplate("accidental_physical_damage", from, component)
            // setTimeout(async () => { await sendMessageTemplate("last_conclusion_message", from) }, 15000);
            startTimer(from)
            return;


        } else if (interactive.list_reply.title == 'Bike Break down') {
            stopTimer()
            const userChatData = await WhatsAppSession.find({ mobileNumber: from.slice(2, 12) })

            let storeUser = await getStoreUser(userChatData[0].locationReply[0].title)
            console.log(storeUser)

            const component = [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": storeUser[0].mobileNumber
                        },
                    ]
                }
            ]

            await sendMessageTemplate("bike_break_down", from, component)
            // setTimeout(async () => { await sendMessageTemplate("last_conclusion_message", from) }, 15000);
            startTimer(from)
            return;


        } else if (interactive.list_reply.title == 'Puncture Related issues') {
            stopTimer()
            await sendMessageTemplate("puncture_related_issues", from)
            // setTimeout(async () => { await sendMessageTemplate("last_conclusion_message", from) }, 15000);
            startTimer(from)
            return;

        }

    } catch (err) {

    }

}
module.exports = { interactiveReply }