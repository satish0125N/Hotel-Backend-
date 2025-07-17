require('dotenv').config(); // This loads your .env file variables
const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;
if (!globalForPrisma.prisma) {
	globalForPrisma.prisma = new PrismaClient();
}
const db = globalForPrisma.prisma;

module.exports = { db };
