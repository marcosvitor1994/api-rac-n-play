const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const eventSelector = require('../middlewares/eventSelector');

/**
 * Rotas da API
 * Todas as rotas agora suportam seleção de evento via query parameter ?event=recnplay ou ?event=global
 */

// Health check - verifica se a API está funcionando
router.get('/health', eventSelector, dataController.healthCheck);

// Busca todas as tabelas disponíveis
router.get('/tables', eventSelector, dataController.getAllTables);

// Busca todos os dados de todas as tabelas
router.get('/data/all', eventSelector, dataController.getAllData);

// Busca dados de uma tabela específica (com paginação)
router.get('/data/:tableName', eventSelector, dataController.getTableData);

// Rota raiz da API
router.get('/', (req, res) => {
  res.json({
    message: 'API Backend - PostgreSQL Multi-Evento',
    version: '2.0.0',
    events: {
      recnplay: "Rec'n'Play",
      global: 'Global Citizen Festival Amazônia'
    },
    usage: {
      description: 'Adicione o parâmetro ?event=recnplay ou ?event=global em qualquer rota',
      examples: [
        'GET /api/tables?event=recnplay',
        'GET /api/tables?event=global',
        'GET /api/data/all?event=recnplay',
        'GET /api/data/:tableName?event=global&limit=100&offset=0'
      ]
    },
    endpoints: {
      health: 'GET /api/health?event={recnplay|global}',
      tables: 'GET /api/tables?event={recnplay|global}',
      allData: 'GET /api/data/all?event={recnplay|global}',
      tableData: 'GET /api/data/:tableName?event={recnplay|global}&limit=100&offset=0'
    },
    defaultEvent: 'recnplay (Rec\'n\'Play é usado quando o parâmetro event não é especificado)'
  });
});

module.exports = router;