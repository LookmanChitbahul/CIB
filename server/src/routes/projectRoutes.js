const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const chatbotController = require('../controllers/chatbotController');

// Chatbot Route
router.post('/chat', chatbotController.chat);

// Dashboard Stats
router.get('/dashboard', projectController.getDashboardStats);

// Export Routes
router.get('/export/excel', projectController.exportToExcel);
router.get('/export/pdf', projectController.exportToPDF);

// CRUD Routes
router.get('/', projectController.getAllProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
