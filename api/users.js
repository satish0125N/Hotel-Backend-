const { db } = require('../utils/db.js');

module.exports = async (req, res) => {
	try {
		const users = await db.user.findMany();
		res.json(users);
	} catch (error) {
		console.error('Error fetching users:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};
