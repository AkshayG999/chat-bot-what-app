const { sendMessageTemplate, textMessage } = require('../sendReplyApi/whatsAppApi')


let timeoutId;

const startTimer = (from) => {
    // set a 3 minute timeout
    timeoutId = setTimeout(async () => {
        // await textMessage("Thank you for contacting us. We haven't received a response from you in a while. If you need any further assistance, please feel free to contact us again.", from);
        await sendMessageTemplate("last_conclusion_message", from)
    }, 15000);
}

const stopTimer = () => {
    // clear the timeout
    clearTimeout(timeoutId);
}

module.exports = { startTimer, stopTimer }