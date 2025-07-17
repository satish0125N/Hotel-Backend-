const express = require('express');
const serverless = require('serverless-http');
const app = express();
const { db } = require('../utils/db.js');

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

// Local development check
if (process.env.NODE_ENV !== 'production') {
	const PORT = 5000;
	app.listen(PORT, () => {
		console.log(`Server running locally on http://localhost:${PORT}`);
	});
}

module.exports = app; // For local require or testing
module.exports.handler = serverless(app); // For Vercel
