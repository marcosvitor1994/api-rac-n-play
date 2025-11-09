const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const eventSelector = require('../middlewares/eventSelector');

/**
 * Rotas da API
 * Todas as rotas agora suportam seleção de evento via query parameter ?event=recnplay, ?event=global ou ?event=cop
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
    version: '3.0.0',
    events: {
      recnplay: "Rec'n'Play",
      global: 'Global Citizen Festival Amazônia',
      cop: 'COP'
    },
    usage: {
      description: 'Adicione o parâmetro ?event=recnplay, ?event=global ou ?event=cop em qualquer rota',
      examples: [
        'GET /api/tables?event=recnplay',
        'GET /api/tables?event=global',
        'GET /api/tables?event=cop',
        'GET /api/data/all?event=recnplay',
        'GET /api/data/:tableName?event=cop&limit=100&offset=0'
      ]
    },
    endpoints: {
      health: 'GET /api/health?event={recnplay|global|cop}',
      tables: 'GET /api/tables?event={recnplay|global|cop}',
      allData: 'GET /api/data/all?event={recnplay|global|cop}',
      tableData: 'GET /api/data/:tableName?event={recnplay|global|cop}&limit=100&offset=0'
    },
    defaultEvent: 'recnplay (Rec\'n\'Play é usado quando o parâmetro event não é especificado)'
  });
});

module.exports = router;