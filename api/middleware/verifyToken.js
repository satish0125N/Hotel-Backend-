const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
	const bearer = req.headers['authorization'];
	if (!bearer) return res.status(403).json({ message: 'No token provided' });

	const token = bearer.split(' ')[1];

	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) return res.status(401).json({ message: 'Invalid token' });

		req.userId = decoded.id;
		next();
	});
};

module.exports = verifyToken;
