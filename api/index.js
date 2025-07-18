// const express = require('express');
// const serverless = require('serverless-http');
// const app = express();
// const { db } = require('./models/db.js');
// const cors = require('cors');
// const bcrypt = require('bcryptjs');

// // Add body parsing middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(
// 	cors({
// 		origin: 'http://localhost:5173', // Allow your frontend URL
// 		credentials: true, // If you are using cookies or sessions
// 	}),
// );

// app.get('/', (req, res) => {
// 	res.send('API is working with Vercel Serverless!ss');
// });

// app.get('/users', async (req, res) => {
// 	try {
// 		const users = await db.users.findMany();
// 		res.json(users);
// 	} catch (error) {
// 		console.error('Error fetching users:', error);
// 		res.status(500).json({ error: 'Internal Server Error' });
// 	}
// });
// //login
// app.post('/login', async (req, res) => {
// 	const { username, password } = req.body;

// 	try {
// 		const user = await db.users.findUnique({
// 			where: { username },
// 		});

// 		if (!user) {
// 			return res.status(401).json({ message: 'Invalid username or password' });
// 		}

// 		const isPasswordValid = await bcrypt.compare(password, user.password);

// 		if (!isPasswordValid) {
// 			return res.status(401).json({ message: 'Invalid username or password' });
// 		}

// 		// You can generate JWT here (optional)
// 		res.json({
// 			message: 'Login successful',
// 			user: {
// 				id: user.id,
// 				username: user.username,
// 				email: user.email,
// 				role: user.role,
// 			},
// 		});
// 	} catch (error) {
// 		console.error('Login Error:', error);
// 		res.status(500).json({ message: 'Internal server error' });
// 	}
// });

// // Local development check
// if (process.env.NODE_ENV !== 'production') {
// 	const PORT = 5000;
// 	app.listen(PORT, () => {
// 		console.log(`Server running locally on http://localhost:${PORT}`);
// 	});
// }

// module.exports = app; // For local require or testing
// module.exports.handler = serverless(app); // For Vercel

const express = require('express');
const app = express();
const serverless = require('serverless-http');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes'); // ✅ Correct Path

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use('/api', authRoutes);

app.get('/', (req, res) => {
	res.send('API Working with MVC!');
});

if (process.env.NODE_ENV !== 'production') {
	app.listen(5000, () => console.log('Server running on http://localhost:5000'));
}

module.exports = app;
module.exports.handler = serverless(app);
