const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projects = [
    {
      pid: 1001,
      projectName: 'City Center Renovation',
      ministryDept: 'Ministry of Infrastructure',
      type: 'ONGOING',
      description: 'Major renovation of the city center plaza with new lighting and pavement.',
      startDate: new Date('2025-01-15'),
      completionDate: null,
      leadProgrammeManager: 'Alice Johnson',
      programmeManager: 'Bob Smith',
      status: 'Phase 1 completed. Starting phase 2 next week.',
      contractValue: '$5,000,000',
      fundAvailable: 'YES',
    },
    {
      pid: 1002,
      projectName: 'Rural Water Supply Phase II',
      ministryDept: 'Ministry of Water',
      type: 'NEW',
      description: 'Expanding water supply network to 5 new villages in the northern district.',
      startDate: new Date('2026-03-01'),
      completionDate: new Date('2026-12-31'),
      leadProgrammeManager: 'Carol White',
      programmeManager: 'David Brown',
      status: 'Initial survey and planning meeting scheduled.',
      contractValue: '$1,200,000',
      fundAvailable: 'FUNDED',
    },
    {
      pid: 1003,
      projectName: 'Public Library Archive Digitization',
      ministryDept: 'Ministry of Culture',
      type: 'COMPLETED',
      description: 'Digitizing historical archives for public access.',
      startDate: new Date('2024-06-01'),
      completionDate: new Date('2025-01-01'),
      leadProgrammeManager: 'Eve Davis',
      programmeManager: 'Frank Wilson',
      status: 'Project fully completed and handed over.',
      contractValue: '$300,000',
      fundAvailable: 'YES',
    },
    {
      pid: 1004,
      projectName: 'Highway X Expansion',
      ministryDept: 'Ministry of Transport',
      type: 'ON_HOLD',
      description: 'Adding two lanes to the main highway connecting the capital to the port.',
      startDate: new Date('2025-02-01'),
      completionDate: null,
      leadProgrammeManager: 'Grace Lee',
      programmeManager: 'Henry Kim',
      status: 'Pending environmental impact assessment approval.',
      contractValue: '$15,000,000',
      fundAvailable: 'NO',
    },
  ];

  console.log('Start seeding ...');
  for (const p of projects) {
    const project = await prisma.project.upsert({
      where: { pid: p.pid },
      update: {},
      create: p,
    });
    console.log(`Created project with id: ${project.id}`);
  }
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
