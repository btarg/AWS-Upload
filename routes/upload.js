const express = require('express');
const parseAndUpload = require('../services/fileParser');
const { checkAuthenticated } = require('../routes/auth')

require('dotenv').config();

const router = express.Router();

router.post('/', async (req, res) => {
    console.log("Hit upload endpoint");
    try {
        const data = await parseAndUpload(req);
        // pass the data directly on success. the json should include downloadLink
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({
            message: "An error occurred.",
            error
        });
    }
});

module.exports = router;