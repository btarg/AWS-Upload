const express = require('express');
const router = express.Router();

require('dotenv').config();

router.get('/', (req, res) => {
    res.json({
        maxFileSize: process.env.MB_MAX || 10000,
        minFileSize: process.env.MB_MIN || 8,
    });
});

module.exports = router;