const express = require('express');

const {
    registerUser,
    getUsers,
    getUserById,
    updateUser,
    loginUser,
    deleteUser
} = require('../controllers/UserController');

const authenticationToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get("/", authenticationToken, authorizeRoles(1), getUsers);
router.put('/:id', authenticationToken, updateUser);
router.delete('/:id', authenticationToken, authorizeRoles(1), deleteUser);
router.get('/:id', authenticationToken, getUserById);

module.exports = router;
