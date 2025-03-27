const cors = require("cors");
require('dotenv').config();

originURL = process.env.CLIENT_URL;

const corsOptions = {
    origin: originURL,
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type"]
};

module.exports = cors(corsOptions);