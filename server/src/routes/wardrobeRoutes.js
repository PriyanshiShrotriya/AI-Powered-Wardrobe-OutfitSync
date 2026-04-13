const express = require('express');
const {
  addClothingItem,
  getWardrobeItems,
  deleteClothingItem,
} = require('../controllers/wardrobeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.route('/').post(addClothingItem).get(getWardrobeItems);
router.delete('/:id', deleteClothingItem);

module.exports = router;
