const express = require('express')
const router = express.Router()
const { messageTypes } = require('../messageTypes/messageTypeController')


router.get('/', (req, res) => {
    res.send("Server Running")
})

router.post('/webhook', messageTypes)


router.get("/webhook", (req, res) => {

    const verify_token = process.env.VERIFY_TOKEN;

    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {

        if (mode === "subscribe" && token === verify_token) {

            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {

            res.sendStatus(403);
        }
    }
});

module.exports = router