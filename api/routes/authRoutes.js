const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/verifyToken');

const {
	loginUser,
	registerUser,
	requestPasswordReset,
	resetPassword,
	getUsers,
	getRooms,
	addRoom,
	updateRoom,
	deleteRoom,
	getBooking,
	getPublicRooms,
} = require('../controllers/authController');

// ✅ Auth Routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// ✅ Protected Admin Routes
router.get('/users', verifyToken, getUsers);
router.get('/rooms', verifyToken, getRooms);
router.post('/rooms', verifyToken, addRoom);
router.put('/rooms/:id', verifyToken, updateRoom);
router.delete('/rooms/:id', verifyToken, deleteRoom);
router.get('/bookings', verifyToken, getBooking);

// ✅ Public Route
router.get('/public-rooms', getPublicRooms);

module.exports = router;
