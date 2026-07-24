const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { getPublicJobs, applyPublic } = require('../controllers/careersController');

router.get('/jobs', getPublicJobs);
router.post('/apply', upload.single('resume'), applyPublic);

module.exports = router;