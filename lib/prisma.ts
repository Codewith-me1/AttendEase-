const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const classes = await prisma.class.findMany();
    console.log(classes);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
