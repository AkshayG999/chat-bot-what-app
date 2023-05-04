const { sendMessageTemplate, textMessage } = require('../sendReplyApi/whatsAppApi')
const { getWebUser } = require('../boonggApi/AxiosCall');
const redis = require('redis');
const client = redis.createClient();


// const userCheck = async (from) => {
//     return await getWebUser(from.slice(2, 12))
// }

// let timeoutId;

// const startTimer = async (from, registered) => {
//     try {

//         if (registered) {

//             timeoutId = setTimeout(async () => {
//                 await sendMessageTemplate("last_conclusion_message", from)
//             }, 15000);

//         } else {

//             const findWebuser = await userCheck(from)

//             if (findWebuser.data.length == 0) {

//                 timeoutId = setTimeout(async () => {
//                     await sendMessageTemplate("last_conclusion_without_mybooking_button", from)
//                 }, 15000);

//             } else {

//                 timeoutId = setTimeout(async () => {
//                     await sendMessageTemplate("last_conclusion_message", from)
//                 }, 15000);
//             }

//         }
//     } catch (err) {
//         console.log(err.message)
//     }
// }

// const stopTimer = () => {
//     // clear the timeout
//     clearTimeout(timeoutId);
// }

// module.exports = { startTimer, stopTimer }

const userCheck = async (from) => {
    return await getWebUser(from.slice(2, 12));
};

const timers = new Map();

// const startTimer = async (from, registered) => {
//     try {
//         const timeout = 15000;

//         if (timers.has(from)) {
//             clearTimeout(timers.get(from));
//         }

//         const timerId = setTimeout(() => {
//             Promise.all([
//                 registered ? sendMessageTemplate("last_conclusion_message", from) : userCheck(from)
//             ]).then(([webUser]) => {
//                 const template = webUser.data.length === 0
//                     ? "last_conclusion_without_mybooking_button"
//                     : "last_conclusion_message";
//                 sendMessageTemplate(template, from);
//                 // timers.delete(from);
//             });
//         }, timeout);

//         timers.set(from, timerId);
//         console.log(`startTimer=,${[...timers]} ${timerId}`)
//     } catch (err) {
//         console.log(err.message);
//     }
// };

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
            console.log(`Starting timer for unregistered user: ${from}`);
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

