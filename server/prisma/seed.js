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

  const ministries = [
    "Prime Ministers Office, Defence, Home Affairs, External Communications", "Ministry of Finance",
    "Ministry of Energy & Public Utilities", "Ministry of Rodrigues, Outer Islands", "Ministry of Housing & Lands",
    "Ministry of Foreign Affairs, Regional Integration & Int Trade", "Ministry of Information Technology, Communication and Innovation",
    "Ministry of National Infrastructure", "Ministry of Education and Human Resource", "Ministry of Tourism",
    "Ministry of Health & Wellness", "Ministry of Arts & Culture", "Ministry of Social Integration, Social Security, National Solidarity",
    "Ministry of Agro-Industry and Food Security, Blue Economy and Fisheries", "Ministry of Industry, SME and Cooperatives",
    "Ministry of Youth and Sports", "Ministry of Commerce and Consumer Protection", "Ministry of Gender Equality and Family Welfare",
    "Ministry of Tertiary Education, Science and Research", "Ministry of Labour and Industrial Relations", "Ministry of Local Government",
    "Ministry of Public Service, Administrative Reforms", "Ministry of Financial Services and Economic Planning",
    "Ministry of Land Transport", "Ministry of Environment, solid Waste Management and Climate Change"
  ];

  const departments = [
    "Central Informatics Bureau", "Central Information Systems Division", "Central Procurement Board", "Civil Status Division",
    "Civil Aviation Department", "Data Protection Office", "Employment Relations Tribunal", "Energy Efficiency Management Office",
    "Forensic Science Laboratory", "Government Printing Department", "Mauritius Meteorological Services", "Mauritius Police Force",
    "Mauritius Prisons Service", "National Archives Department", "National Land Transport Authority", "Office of Public Sector Governance",
    "Pa& Immigration Office", "Pay Research Bureau", "Procurement Policy Office", "Registrar General Dept", "Statistics Mauritius",
    "Energy Services Division", "Valuation Department", "The Treasury", "National Assembly", "Board of Investment", "The Judiciary",
    "Government Online Centre", "Registrar of Companies", "Mauritius Research Council", "Supreme Court", "Public Service Commission",
    "Local Government Services Commission", "Radiation Protection Agency", "Office of President", "Office of Vice President",
    "Office of DPP", "Traffic Branch", "NHDC", "MITD", "Mauritius Post Ltd", "Mauritius Digital Promotion Agency", "National Audit Office",
    "National Human Rights Commission", "Equal Opportunities Commission", "National Disaster for Risk Reduction Mgt Centre",
    "Public Bodies Appeal Tribunal", "Ombudsman Office", "Ombudsman for Children Office", "Revenue & Valuation Appeal Tribunal",
    "Electoral Commissioners Office", "National Empowerment Foundation", "Mauritius Tourism Promotion Authority",
    "Leal Communications & Informatics", "ICTA", "Mauritius Fire and Rescue Services", "Mauritius Standard Bureau",
    "Indian Ocean Commission", "Financial Intelligence Unit", "CBRD", "SME Registration Unit", "Government Information Services",
    "Independent Police Complaints Commission", "Counter Terrorism Unit", "Law Reform Commission", "MPI Phoenix", "Bank of Mauritius",
    "SafeCity", "Work Permit", "Mauritas", "MNIC", "Dept of Continental Shelf and Maritime Zones Administration and Exploration",
    "CERT-MU", "MRA", "Cabinet Office", "Intellectual Property Office (IPO)", "Registry of Associations", "World Hindi Secretariat",
    "MVL", "Chief Whip office", "SSRN Hospital", "HRDC", "MIH/PAMPLEMOUSSES", "Legal Metrology", "NEF", "National Coast Guard",
    "site visit to schools/college regarding connectivity", "Solid Waste Management Division", "Road safety Observatory", "Agileum",
    "TMRSU", "Ispace Technologies Ltd.", "Visitation RCA", "Site Visit of MCC", "Albion Fisheries", "Police IT UNIT",
    "Nelson Mandela Centre", "University of Mauritius", "METISS Site Visit", "Crime Record Office", "Ombudsperson for Financial Services",
    "polytechnics Mauritius", "ELUAT", "NTA", "Financial Services Commission", "ARC-MOFED", "New Supreme Court", "Beach Authority",
    "Simadree Virahsawmy SSS - Site Readiness for By electionBy election 2019", "Chinese Embassy", "Petite Riviere CHC", "WMA",
    "MGI", "National Sanctions Secretariat", "Victoria Hospital", "ENT Hospital", "Water Resources Unit", "Mauritius Housing Corporation",
    "POWC", "Mauritius Telecoms", "ICAC", "University of Mauritius", "University of Technology, Mauritius", "Open University of Mauritius",
    "Mauritius Examination Syndicate", "Mauritius Institute of Education", "Flacq Hopital", "J Nehru Hopital", "Dr A G Jeetoo Hospital",
    "Human rights Division", "NSIF", "Ombudsperson for Children", "Economic Development Board", "Tourism Authority", "Airport of Mauritius",
    "Central Health Lab", "National Library", "National Heritage Fund", "Civil Service College", "National Environmental Lab",
    "Ispace Technologies Ltd", "Higher Education Commission", "Rehabilitation Youth Centre", "Central Supermarket , Q bornes",
    "University of Mascareignes", "Gambling Regulatory Authority", "National Plant Protection Office", "UNDP", "Mauritius Ports Authority",
    "State Informatics Limited", "Road Development Authority", "EWF", "Family Planning welfare Association", "Mexa"
  ];

  const leadPMs = [
    "Jhurree M", "Pavaday G", "Beeharry A", "Baguant K", "Betchoo H", "Lam Cham Kee V",
    "Peeraully-Doarika N", "Beerbul S", "Putteeraj S", "Mohabeer P", "Chitamun T"
  ];

  const pms = [
    "Goburdhone P", "Jeetoo K", "Gooljar-Busgeet R", "Beethue N", "Luckun R", "Ramparsad G",
    "Lutchman D", "Ramful D", "Ramdoyal Y", "Taukoordass B", "Ujoodha N"
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

  console.log('Seeding Registry ...');
  for (const name of ministries) {
    await prisma.ministry.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of departments) {
    await prisma.department.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of leadPMs) {
    await prisma.personnel.upsert({ where: { name }, update: { role: 'LEAD_PM' }, create: { name, role: 'LEAD_PM' } });
  }
  for (const name of pms) {
    await prisma.personnel.upsert({ where: { name }, update: { role: 'PM' }, create: { name, role: 'PM' } });
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
