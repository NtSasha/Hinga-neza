const express = require('express');
const { registerUser, getUsers, getUserById } = require('../controllers/UserController');

const router = express.Router();

router.post('/register', registerUser);
router.get('/', getUsers);
router.get('/:id', getUserById);

module.exports = router;
