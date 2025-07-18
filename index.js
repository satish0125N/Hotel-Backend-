// const express = require('express');
// const { Pool } = require('pg');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const serverless = require('serverless-http');

// const app = express();

// // Middlewares
// app.use(cors());
// app.use(express.json());

// // Database Connection (PostgreSQL example)
// const pool = new Pool({
// 	connectionString: process.env.DATABASE_URL,
// });

// // Sample Route
// app.get('/', (req, res) => {
// 	res.send('Hello from Vercel Serverless with Express + PostgreSQL!');
// });

// // Example Route using Pool
// app.get('/api/users', async (req, res) => {
// 	try {
// 		const result = await pool.query('SELECT * FROM users');
// 		res.json(result.rows);
// 	} catch (err) {
// 		res.status(500).json({ error: err.message });
// 	}
// });

// // Export serverless handler
// module.exports.handler = serverless(app);
