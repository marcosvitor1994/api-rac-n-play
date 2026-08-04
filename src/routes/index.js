const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const eventSelector = require('../middlewares/eventSelector');

/**
 * Rotas da API
 * Todas as rotas suportam seleção de evento via query parameter ?event=recnplay, ?event=global, ?event=cop, ?event=sest, ?event=southsummit, ?event=rio2c ou ?event=mulheres
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
      cop: 'COP',
      sest: 'SEST SENAT COP 30',
      southsummit: 'South Summit',
      rio2c: 'Rio2C',
      mulheres: 'Wiki Delas'
    },
    usage: {
      description: 'Adicione o parâmetro ?event= em qualquer rota',
      examples: [
        'GET /api/tables?event=recnplay',
        'GET /api/tables?event=global',
        'GET /api/tables?event=cop',
        'GET /api/tables?event=sest',
        'GET /api/tables?event=southsummit',
        'GET /api/tables?event=rio2c',
        'GET /api/tables?event=mulheres',
        'GET /api/data/all?event=recnplay',
        'GET /api/data/:tableName?event=mulheres&limit=100&offset=0'
      ]
    },
    endpoints: {
      health: 'GET /api/health?event={recnplay|global|cop|sest|southsummit|rio2c|mulheres}',
      tables: 'GET /api/tables?event={recnplay|global|cop|sest|southsummit|rio2c|mulheres}',
      allData: 'GET /api/data/all?event={recnplay|global|cop|sest|southsummit|rio2c|mulheres}',
      tableData: 'GET /api/data/:tableName?event={recnplay|global|cop|sest|southsummit|rio2c|mulheres}&limit=100&offset=0'
    },
    defaultEvent: 'recnplay (Rec\'n\'Play é usado quando o parâmetro event não é especificado)'
  });
});

module.exports = router;