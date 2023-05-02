const { textReply } = require('../controllers/textReplyController')
const { interactiveReply } = require('../controllers/interactiveReplyController')
const { buttonReply } = require('../controllers/buttonReplyController')



const messageTypes = async (req, res) => {
    try {
        const { entry, object } = req.body
        // console.log(JSON.stringify(req.body, null, 2));

        res.sendStatus(200);

        if (object && entry[0]) {

            const { changes } = entry[0]
            const { value } = changes[0]
            const { messages } = value  //msg Object 

                 //text messsage reply
            if (entry && entry[0] && changes && changes[0] && value && messages && messages[0].text) {

                return textReply(messages)

                // Interactive message reply
            } else if (entry && entry[0] && changes && changes[0] && value && messages && messages[0].interactive) {

                return interactiveReply(messages)

                // Button message reply
            } else if (entry && entry[0] && changes && changes[0] && value && messages && messages[0].button) {

                return buttonReply(messages)
            }
        }

    } catch (err) {
        console.log(err)
    }


}

module.exports = { messageTypes }