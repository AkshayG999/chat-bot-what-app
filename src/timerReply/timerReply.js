const { sendMessageTemplate, textMessage } = require('../sendReplyApi/whatsAppApi')
const { getWebUser } = require('../boonggApi/AxiosCall');
const redis = require('redis');
const client = redis.createClient();


const userCheck = async (from) => {
    return await getWebUser(from.slice(2, 12));
};

const timers = new Map();

const startTimer = async (from, registered) => {
    try {
        // Check if a timer is already running for this user
        if (timers.has(from)) {
            console.log(`Timer already running for ${from}`);
            return;
        }

        if (registered) {
            console.log(`Starting timer for registered user: ${from}`);
            const timerId = setTimeout(async () => {
                await sendMessageTemplate("last_conclusion_message", from);
                timers.delete(from); // Remove the timer from the map
            }, 15000);
            timers.set(from, timerId); // Add the timer to the map
        } else {
            console.log(`Starting timer: ${from}`);

            const findWebuser = await userCheck(from);
            let messageTemplate = "last_conclusion_without_mybooking_button";

            if (findWebuser.data.length > 0) {
                messageTemplate = "last_conclusion_message";
            }
            const timerId = setTimeout(async () => {
                await sendMessageTemplate(messageTemplate, from);
                timers.delete(from); // Remove the timer from the map
            }, 15000);
            timers.set(from, timerId); // Add the timer to the map
        }
    } catch (err) {
        console.log(err.message);
    }
};

const stopTimer = (from) => {
    console.log(`stopTimer= ${[...timers]}`)

    if (timers.has(from)) {
        clearTimeout(timers.get(from));
        timers.delete(from);
    }
};

module.exports = { startTimer, stopTimer };

