const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { uploadResume, saveParsedData } = require('../controllers/resumeController');

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.put('/:id/parsed-data', protect, saveParsedData);

module.exports = router;