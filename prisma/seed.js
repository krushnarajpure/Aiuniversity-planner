const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    try {
        // Create test user
        const testUser = await prisma.user.upsert({
            where: { email: "test@university.edu" },
            update: {},
            create: {
                name: "Test Student",
                email: "test@university.edu",
                password: await bcrypt.hash("password123", 10),
                role: "STUDENT",
                university: "Test University",
                department: "Computer Science",
                semester: "6",
                cgpa: 8.5,
            },
        });

        console.log(`Test user created/updated: ${testUser.email}`);

        // Create another test user
        const testUser2 = await prisma.user.upsert({
            where: { email: "student@university.edu" },
            update: {},
            create: {
                name: "John Doe",
                email: "student@university.edu",
                password: await bcrypt.hash("password123", 10),
                role: "STUDENT",
                university: "Test University",
                department: "Information Technology",
                semester: "7",
                cgpa: 7.8,
            },
        });

        console.log(`Test user 2 created/updated: ${testUser2.email}`);
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
