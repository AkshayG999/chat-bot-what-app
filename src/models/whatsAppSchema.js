const mongoose = require('mongoose')

const WhatsAppSchema = new mongoose.Schema({
    mobileNumber: String,
    cityReply: [Object],
    locationReply: [Object],
    button: {
        type: String,
        default: false
    }
}, { timestamps: true })

const WhatsAppSession = mongoose.model('whatsappsession', WhatsAppSchema)
module.exports = WhatsAppSession