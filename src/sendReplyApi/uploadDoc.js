const FormData = require('form-data')
const fs = require('fs').promises
const axios = require('axios')
const path = require('path')

const uploadWhatsAppDocument = async (fileName) => {
    try {
        const filePath = path.join(__dirname, '../pdf/nodejs.pdf')  
        const image = await fs.readFile(filePath);
        const form_data = new FormData();
        form_data.append("file", image, fileName);
        form_data.append('messaging_product', 'whatsapp');

        const resp = await axios.post(
            `https://graph.facebook.com/v15.0/${process.env.WHATSAPP_PHONEID}/media`,
            form_data,
            {
                headers: Object.assign({}, form_data.getHeaders(), {
                    'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
                })
            }
        );
        return resp.data;

    } catch (err) {
        console.log("Upload Error ", err);
        return err;
    }
};

module.exports = { uploadWhatsAppDocument }