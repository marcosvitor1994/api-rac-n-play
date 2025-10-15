const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

/**
 * Rotas da API
 */

// Health check - verifica se a API está funcionando
router.get('/health', dataController.healthCheck);

// Busca todas as tabelas disponíveis
router.get('/tables', dataController.getAllTables);

// Busca todos os dados de todas as tabelas
router.get('/data/all', dataController.getAllData);

// Busca dados de uma tabela específica (com paginação)
router.get('/data/:tableName', dataController.getTableData);

// Rota raiz da API
router.get('/', (req, res) => {
  res.json({
    message: 'API Backend - PostgreSQL',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      tables: 'GET /api/tables',
      allData: 'GET /api/data/all',
      tableData: 'GET /api/data/:tableName?limit=100&offset=0'
    }
  });
});

module.exports = router;