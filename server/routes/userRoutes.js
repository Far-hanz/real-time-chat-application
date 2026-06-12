const express = require('express');
const { getMe, updateMe, getUsers, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.get('/me', getMe);
router.put('/me', updateMe);
router.get('/:id', getUserById);

module.exports = router;
