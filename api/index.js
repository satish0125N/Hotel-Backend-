const express = require('express');
const serverless = require('serverless-http');
const app = express();
const { db } = require('../utils/db.js');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Add body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
	cors({
		origin: 'http://localhost:5173', // Allow your frontend URL
		credentials: true, // If you are using cookies or sessions
	}),
);

app.get('/', (req, res) => {
	res.send('API is working with Vercel Serverless!');
});

app.get('/users', async (req, res) => {
	try {
		const users = await db.user.findMany();
		res.json(users);
	} catch (error) {
		console.error('Error fetching users:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// login
app.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: 'Email and password are required' });
		}

		// Find user by email
		const user = await db.user.findUnique({
			where: { email },
		});

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// ✅ Check password using bcrypt
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		// ✅ Exclude password from response
		const { password: _, ...userData } = user;

		// ✅ Optional: Generate Token here (JWT) if needed
		res.json({ message: 'Login successful', user: userData });
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Local development check
if (process.env.NODE_ENV !== 'production') {
	const PORT = 5000;
	app.listen(PORT, () => {
		console.log(`Server running locally on http://localhost:${PORT}`);
	});
}

module.exports = app; // For local require or testing
module.exports.handler = serverless(app); // For Vercel
