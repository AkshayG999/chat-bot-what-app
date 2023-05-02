const { sendMessageTemplate, textMessage } = require('../sendReplyApi/whatsAppApi')
const { getWebUser } = require('../boonggApi/AxiosCall');

const userCheck = async (from) => {
    return await getWebUser(from.slice(2, 12))
}

let timeoutId;

const startTimer = async (from, registered) => {
    try {
        
        if (registered) {

            timeoutId = setTimeout(async () => {
                await sendMessageTemplate("last_conclusion_message", from)
            }, 15000);

        } else {

            const findWebuser = await userCheck(from)

            if (findWebuser.data.length == 0) {

                timeoutId = setTimeout(async () => {
                    await sendMessageTemplate("last_conclusion_without_mybooking_button", from)
                }, 15000);

            } else {

                timeoutId = setTimeout(async () => {
                    await sendMessageTemplate("last_conclusion_message", from)
                }, 15000);
            }

        }
    } catch (err) {
        console.log(err.message)
    }
}

const stopTimer = () => {
    // clear the timeout
    clearTimeout(timeoutId);
}

module.exports = { startTimer, stopTimer }