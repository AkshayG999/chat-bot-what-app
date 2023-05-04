"use strict";

const express = require("express")
const body_parser = require("body-parser")
const app = express().use(body_parser.json());
const cors = require('cors')
require('dotenv').config()
require('./db/db');

app.use(cors())
app.use('/', require('./routes/route'))


app.listen(process.env.PORT || 3005, () => console.log("webhook is listening"));

