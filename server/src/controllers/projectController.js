const { PrismaClient } = require('@prisma/client');
const excel = require('exceljs');
const PDFDocument = require('pdfkit');

const prisma = new PrismaClient();

// Helper to build where clause from query params
const buildWhereClause = (query) => {
    const { search, type, fundAvailable, isDraft } = query;
    const where = {};

    if (search) {
        where.OR = [
            { projectName: { contains: search, mode: 'insensitive' } },
            { ministryDept: { contains: search, mode: 'insensitive' } },
            { leadProgrammeManager: { contains: search, mode: 'insensitive' } },
            { programmeManager: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }

    if (type) {
        where.type = type;
    }

    if (fundAvailable) {
        where.fundAvailable = fundAvailable;
    }

    if (isDraft !== undefined) {
        // Handle both string 'true'/'false' from query and boolean true/false
        where.isDraft = isDraft === 'true' || isDraft === true;
    }

    return where;
};

exports.getAllProjects = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, sortBy = 'updatedAt', sortOrder = 'desc', ...filters } = req.query;

        const where = buildWhereClause(filters);

        const skip = (parseInt(page) - 1) * parseInt(pageSize);
        const take = parseInt(pageSize);

        const [projects, total] = await prisma.$transaction([
            prisma.project.findMany({
                where,
                skip,
                take,
                orderBy: {
                    [sortBy]: sortOrder === 'descend' ? 'desc' : (sortOrder === 'ascend' ? 'asc' : sortOrder),
                },
            }),
            prisma.project.count({ where }),
        ]);

        res.json({
            data: projects,
            meta: {
                total,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                totalPages: Math.ceil(total / parseInt(pageSize)),
            },
        });
    } catch (error) {
        console.error('Fetch Projects Error:', error);
        res.status(500).json({ error: 'Failed to fetch projects', details: error.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id: parseInt(id) },
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project', details: error.message });
    }
};

exports.createProject = async (req, res) => {
    try {
        const data = req.body;
        // Ensure date fields are proper Date objects
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.completionDate) data.completionDate = new Date(data.completionDate);

        // Ensure PID is integer
        if (data.pid) data.pid = parseInt(data.pid);

        const project = await prisma.project.create({
            data,
        });

        res.status(201).json(project);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'A project with this PID already exists.' });
        }
        res.status(500).json({ error: 'Failed to create project', details: error.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.completionDate) data.completionDate = new Date(data.completionDate);
        if (data.pid) data.pid = parseInt(data.pid);

        // Remove id from update data if present
        delete data.id;

        const project = await prisma.project.update({
            where: { id: parseInt(id) },
            data,
        });

        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project', details: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.project.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project', details: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalProjects = await prisma.project.count({ where: { isDraft: false } });
        const totalDrafts = await prisma.project.count({ where: { isDraft: true } });

        const projectsByType = await prisma.project.groupBy({
            where: { isDraft: false },
            by: ['type'],
            _count: {
                type: true,
            },
        });

        const projectsByFund = await prisma.project.groupBy({
            where: { isDraft: false },
            by: ['fundAvailable'],
            _count: {
                fundAvailable: true,
            },
        });

        // Recent projects
        const recentProjects = await prisma.project.findMany({
            where: { isDraft: false },
            take: 5,
            orderBy: { updatedAt: 'desc' }
        });

        const allProjectsStartStructure = await prisma.project.findMany({
            where: { isDraft: false },
            select: { startDate: true }
        });

        // Process in JS
        const timeline = {};
        allProjectsStartStructure.forEach(p => {
            if (p.startDate) {
                const month = p.startDate.toISOString().slice(0, 7); // YYYY-MM
                timeline[month] = (timeline[month] || 0) + 1;
            }
        });

        const projectsOverTime = Object.entries(timeline).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));

        res.json({
            totalProjects,
            totalDrafts,
            projectsByType: projectsByType.map(p => ({ type: p.type, count: p._count.type })),
            projectsByFund: projectsByFund.map(p => ({ fundAvailable: p.fundAvailable, count: p._count.fundAvailable })),
            recentProjects,
            projectsOverTime
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ error: 'Failed to get dashboard stats', details: error.message });
    }
};

exports.exportToExcel = async (req, res) => {
    try {
        const { sortBy = 'updatedAt', sortOrder = 'desc', ...filters } = req.query;
        const where = buildWhereClause(filters);

        const projects = await prisma.project.findMany({
            where,
            orderBy: { [sortBy]: sortOrder === 'descend' ? 'desc' : (sortOrder === 'ascend' ? 'asc' : sortOrder) },
        });

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Projects');

        worksheet.columns = [
            { header: 'PID', key: 'pid', width: 10 },
            { header: 'Project Name', key: 'projectName', width: 30 },
            { header: 'Ministry/Dept', key: 'ministryDept', width: 25 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Status', key: 'status', width: 30 },
            { header: 'Funding', key: 'fundAvailable', width: 15 },
            { header: 'Start Date', key: 'startDate', width: 15 },
            { header: 'Completion Date', key: 'completionDate', width: 15 },
            { header: 'Contract Value', key: 'contractValue', width: 15 },
        ];

        // Style header
        worksheet.getRow(1).font = { bold: true };

        projects.forEach(p => {
            worksheet.addRow({
                ...p,
                startDate: p.startDate ? p.startDate.toISOString().split('T')[0] : '',
                completionDate: p.completionDate ? p.completionDate.toISOString().split('T')[0] : '',
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=projects.xlsx');

        await workbook.xlsx.write(res);
        res.status(200).end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Export failed' });
    }
};

exports.exportToPDF = async (req, res) => {
    try {
        const { sortBy = 'updatedAt', sortOrder = 'desc', ...filters } = req.query;
        const where = buildWhereClause(filters);

        const projects = await prisma.project.findMany({
            where,
            orderBy: { [sortBy]: sortOrder === 'descend' ? 'desc' : (sortOrder === 'ascend' ? 'asc' : sortOrder) },
        });

        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=projects.pdf');

        doc.pipe(res);

        doc.fontSize(18).text('CIB Projects Report', { align: 'center' });
        doc.moveDown();

        // Simple table implementation for PDF
        const tableTop = 100;
        let y = tableTop;

        // Headers
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('PID', 30, y);
        doc.text('Project Name', 70, y);
        doc.text('Ministry', 250, y);
        doc.text('Type', 400, y);
        doc.text('Funding', 500, y);
        doc.text('Value', 580, y);
        doc.text('Start Date', 650, y);

        y += 20;
        doc.font('Helvetica').fontSize(9);

        projects.forEach(p => {
            if (y > 500) {
                doc.addPage({ layout: 'landscape' });
                y = 50;
            }

            doc.text(p.pid ? p.pid.toString() : '', 30, y);
            doc.text(p.projectName ? p.projectName.substring(0, 35) : '', 70, y);
            doc.text(p.ministryDept ? p.ministryDept.substring(0, 25) : '', 250, y);
            doc.text(p.type || '', 400, y);
            doc.text(p.fundAvailable || '', 500, y);
            doc.text(p.contractValue || '', 580, y);
            doc.text(p.startDate ? p.startDate.toISOString().split('T')[0] : '', 650, y);

            y += 20;
        });

        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Export failed' });
    }
};
