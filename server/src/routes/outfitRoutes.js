const express = require('express');
const { recommendOutfit, getLiveWeather } = require('../controllers/outfitController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/weather', getLiveWeather);
router.post('/recommend', recommendOutfit);

module.exports = router;
