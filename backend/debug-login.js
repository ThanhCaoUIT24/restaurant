const { login } = require('./src/services/auth.service');
const { prisma } = require('./src/config/db');

async function main() {
    try {
        console.log('Attempting login for stock...');
        const result = await login({ username: 'stock', password: 'stock123' });
        console.log('Login successful:', result.user.username);
    } catch (error) {
        console.error('LOGIN ERROR:', error);
        if (error instanceof Error) {
            console.error('Stack:', error.stack);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
