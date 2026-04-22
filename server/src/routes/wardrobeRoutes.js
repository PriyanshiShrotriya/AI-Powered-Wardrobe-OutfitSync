const express = require('express');
const {
  addClothingItem,
  analyzeWardrobeItem,
  getWardrobeAnalysisJob,
  getWardrobeItems,
  deleteClothingItem,
} = require('../controllers/wardrobeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.post('/analyze', analyzeWardrobeItem);
router.get('/analyze/:jobId', getWardrobeAnalysisJob);
router.route('/').post(addClothingItem).get(getWardrobeItems);
router.delete('/:id', deleteClothingItem);

module.exports = router;
