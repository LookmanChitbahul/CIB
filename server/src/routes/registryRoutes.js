const express = require('express');
const router = express.Router();
const registryController = require('../controllers/registryController');

// Ministries
router.get('/ministries', registryController.getAllMinistries);
router.post('/ministries', registryController.upsertMinistry);
router.delete('/ministries/:id', registryController.deleteMinistry);

// Departments
router.get('/departments', registryController.getAllDepartments);
router.post('/departments', registryController.upsertDepartment);
router.delete('/departments/:id', registryController.deleteDepartment);

// Personnel
router.get('/personnel', registryController.getAllPersonnel);
router.post('/personnel', registryController.upsertPersonnel);
router.delete('/personnel/:id', registryController.deletePersonnel);

module.exports = router;
