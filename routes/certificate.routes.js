const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');

router.get('/certificate/:userId/:courseId', certificateController.getUserCertificate);

module.exports = router;