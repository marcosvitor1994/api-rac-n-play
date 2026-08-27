const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const eventSelector = require('../middlewares/eventSelector');

const { EVENTS } = eventSelector;
const EVENT_KEYS = Object.keys(EVENTS);
const EVENT_LIST = EVENT_KEYS.join('|');

/**
 * Rotas da API
 * Todas as rotas suportam seleção de evento via query parameter ?event=
 * Ex.: ?event=recnplay, ?event=rio2c, ?event=mulheres, ?event=jornada
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
  // Monta a lista de eventos a partir do registro central
  const events = {};
  for (const key of EVENT_KEYS) {
    events[key] = EVENTS[key].name;
  }

  res.json({
    message: 'API Backend - Multi-Evento (PostgreSQL + Firebase)',
    version: '4.0.0',
    events,
    sources: EVENT_KEYS.reduce((acc, key) => {
      acc[key] = EVENTS[key].source;
      return acc;
    }, {}),
    usage: {
      description: 'Adicione o parâmetro ?event= em qualquer rota',
      examples: [
        'GET /api/tables?event=recnplay',
        'GET /api/tables?event=jornada',
        'GET /api/data/all?event=mulheres',
        'GET /api/data/:tableName?event=rio2c&limit=100&offset=0',
        'GET /api/data/:collection?event=jornada&limit=100&offset=0'
      ]
    },
    endpoints: {
      health: `GET /api/health?event={${EVENT_LIST}}`,
      tables: `GET /api/tables?event={${EVENT_LIST}}`,
      allData: `GET /api/data/all?event={${EVENT_LIST}}`,
      tableData: `GET /api/data/:tableName?event={${EVENT_LIST}}&limit=100&offset=0`
    },
    notes: {
      firestore:
        'Eventos com fonte "firestore" mapeiam coleção -> tabela e documento -> linha ' +
        '(o id do documento vai no campo _id). A coleção especial "_auth_users" expõe ' +
        'os usuários do Firebase Authentication. Subcoleções usam "~" como separador, ' +
        'ex: /api/data/users~abc123~pedidos?event=jornada'
    },
    defaultEvent: 'recnplay (Rec\'n\'Play é usado quando o parâmetro event não é especificado)'
  });
});

module.exports = router;
