const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ministries
exports.getAllMinistries = async (req, res) => {
    try {
        const ministries = await prisma.ministry.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(ministries);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ministries', details: error.message });
    }
};

exports.upsertMinistry = async (req, res) => {
    try {
        const { id, name, isActive } = req.body;
        const ministry = await prisma.ministry.upsert({
            where: { id: id || -1 },
            update: { name, isActive },
            create: { name, isActive: isActive ?? true }
        });
        res.json(ministry);
    } catch (error) {
        res.status(400).json({ error: 'Ministry operation failed', details: error.message });
    }
};

exports.deleteMinistry = async (req, res) => {
    try {
        await prisma.ministry.delete({ where: { id: parseInt(req.params.id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete ministry' });
    }
};

// Departments
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments', details: error.message });
    }
};

exports.upsertDepartment = async (req, res) => {
    try {
        const { id, name, isActive } = req.body;
        const department = await prisma.department.upsert({
            where: { id: id || -1 },
            update: { name, isActive },
            create: { name, isActive: isActive ?? true }
        });
        res.json(department);
    } catch (error) {
        res.status(400).json({ error: 'Department operation failed', details: error.message });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        await prisma.department.delete({ where: { id: parseInt(req.params.id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete department' });
    }
};

// Personnel
exports.getAllPersonnel = async (req, res) => {
    try {
        const personnel = await prisma.personnel.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(personnel);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch personnel', details: error.message });
    }
};

exports.upsertPersonnel = async (req, res) => {
    try {
        const { id, name, role, isActive } = req.body;
        const personnel = await prisma.personnel.upsert({
            where: { id: id || -1 },
            update: { name, role, isActive },
            create: { name, role, isActive: isActive ?? true }
        });
        res.json(personnel);
    } catch (error) {
        res.status(400).json({ error: 'Personnel operation failed', details: error.message });
    }
};

exports.deletePersonnel = async (req, res) => {
    try {
        await prisma.personnel.delete({ where: { id: parseInt(req.params.id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete personnel' });
    }
};
