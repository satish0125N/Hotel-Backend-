const bcrypt = require('bcryptjs');
const prisma = require('../../models/db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.registerUser = async (req, res) => {
	try {
		const { username, password, email, full_name, phone, address } = req.body;
		if (!username || !password || !email || !full_name) {
			return res.status(400).json({ message: 'All required fields are missing' });
		}

		const existingUser = await prisma.users.findUnique({ where: { username } });
		if (existingUser) {
			return res.status(409).json({ message: 'Username already exists' });
		}

		const existingEmail = await prisma.users.findUnique({ where: { email } });
		if (existingEmail) {
			return res.status(409).json({ message: 'Email already exists' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await prisma.users.create({
			data: {
				username,
				password: hashedPassword,
				email,
				full_name,
				phone,
				address,
			},
		});

		res.status(201).json({ message: 'Registration successful', user: newUser });
	} catch (error) {
		console.error('Registration Error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// ✅ Request Password Reset
exports.requestPasswordReset = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ message: 'Email is required' });

		const user = await prisma.users.findUnique({ where: { email } });
		if (!user) return res.status(404).json({ message: 'User not found' });

		const token = crypto.randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1hr

		await prisma.password_resets.create({
			data: { email, token, expires_at: expiresAt },
		});

		// ✅ Send email
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		const resetLink = `${
			process.env.FRONTEND_URL || 'http://localhost:5173'
		}/reset-password?token=${token}`;

		await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: email,
			subject: 'Password Reset Link',
			html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
		});

		res.status(200).json({ message: 'Password reset link sent to your email' });
	} catch (error) {
		console.error('Password Reset Request Error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// ✅ Reset Password
exports.resetPassword = async (req, res) => {
	try {
		const { token, newPassword } = req.body;
		if (!token || !newPassword) {
			return res
				.status(400)
				.json({ message: 'Token and new password are required' });
		}

		const resetEntry = await prisma.password_resets.findFirst({
			where: { token },
		});

		if (!resetEntry || resetEntry.expires_at < new Date() || resetEntry.used) {
			return res.status(400).json({ message: 'Invalid or expired token' });
		}

		await prisma.users.update({
			where: { email: resetEntry.email },
			data: { password: await bcrypt.hash(newPassword, 10) },
		});

		await prisma.password_resets.update({
			where: { id: resetEntry.id },
			data: { used: true },
		});

		res.status(200).json({ message: 'Password reset successful' });
	} catch (error) {
		console.error('Password Reset Error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

exports.loginUser = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await prisma.users.findUnique({
			where: { username },
		});

		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		// ✅ JWT Token Generate
		const token = jwt.sign(
			{ id: user.id, username: user.username, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: '1d' },
		);

		res.status(200).json({
			message: 'Login successful',
			token,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		console.error('Login Error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

//get users
exports.getUsers = async (req, res) => {
	try {
		const users = await prisma.users.findMany({
			select: {
				id: true,
				username: true,
				email: true,
				role: true,
				created_at: true,
			},
		});
		res.status(200).json(users);
	} catch (error) {
		console.error('Get Users Error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

exports.getRooms = async (req, res) => {
	try {
		const rooms = await prisma.rooms.findMany({
			select: {
				id: true,
				room_type: true,
				capacity: true,
				price_per_night: true,
				amenities: true,
				image_url: true,
			},
		});
		res.status(200).json(rooms);
	} catch (error) {
		console.error('Get Users Error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

exports.getBooking = async (req, res) => {
	try {
		const bookings = await prisma.bookings.findMany({
			select: {
				id: true,
				user_id: true,
				room_id: true,
				checkin_date: true,
				checkout_date: true,
				number_of_guests: true,
				total_price: true,
				user: {
					select: {
						username: true, // 👈 user ka naam milega
					},
				},
				room: {
					select: {
						room_type: true,
					},
				},
			},
		});
		res.status(200).json(bookings);
		console.log(bookings);
	} catch (error) {
		console.error('Get Users Error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

exports.addRoom = async (req, res) => {
	try {
		const { room_type, capacity, price_per_night, amenities, image_url, images } =
			req.body;
		const newRoom = await prisma.rooms.create({
			data: {
				room_type,
				capacity,
				price_per_night,
				amenities,
				image_url,
				images,
			},
		});
		res.status(201).json(newRoom);
	} catch (error) {
		console.error('Add Room Error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

exports.updateRoom = async (req, res) => {
	try {
		const { id } = req.params;
		const { room_type, capacity, price_per_night, amenities, image_url, images } =
			req.body;

		const updatedRoom = await prisma.rooms.update({
			where: { id: parseInt(id) },
			data: {
				room_type,
				capacity,
				price_per_night,
				amenities,
				image_url,
				images,
			},
		});
		res.status(200).json(updatedRoom);
	} catch (error) {
		console.error('Update Room Error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

exports.deleteRoom = async (req, res) => {
	try {
		const { id } = req.params;
		await prisma.rooms.delete({
			where: { id: parseInt(id) },
		});
		res.status(200).json({ message: 'Room deleted successfully' });
	} catch (error) {
		console.error('Delete Room Error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

exports.getPublicRooms = async (req, res) => {
	try {
		const rooms = await prisma.rooms.findMany({
			select: {
				id: true,
				room_type: true,
				capacity: true,
				price_per_night: true,
				amenities: true,
				image_url: true,
			},
		});
		res.status(200).json(rooms);
	} catch (error) {
		console.error('Get Public Rooms Error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};
