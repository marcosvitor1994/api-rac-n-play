const { getPool } = require('../config/database');
const createPostgresSource = require('../services/postgresSource');
const createFirestoreSource = require('../services/firestoreSource');

/**
 * Registro de eventos suportados pela API
 *
 * Cada evento define seu nome de exibição, a fonte de dados e os aliases
 * aceitos no parâmetro ?event= (ou no header X-Event).
 *
 * source: 'postgres' -> usa o pool correspondente em config/database.js
 *         'firestore' -> usa o Firebase Admin em config/firebase.js
 */
const EVENTS = {
  recnplay: {
    name: "Rec'n'Play",
    source: 'postgres',
    aliases: ['rec-n-play', 'rec_n_play', 'recnplay']
  },
  global: {
    name: 'Global Citizen Festival Amazônia',
    source: 'postgres',
    aliases: ['globalcitizen', 'global-citizen', 'global_citizen']
  },
  cop: {
    name: 'COP',
    source: 'postgres',
    aliases: []
  },
  sest: {
    name: 'SEST SENAT COP 30',
    source: 'postgres',
    aliases: ['sestsenat', 'sest-senat', 'sest_senat']
  },
  southsummit: {
    name: 'South Summit',
    source: 'postgres',
    aliases: ['south-summit', 'south_summit']
  },
  rio2c: {
    name: 'Rio2C',
    source: 'postgres',
    aliases: ['rio-2c', 'rio_2c']
  },
  mulheres: {
    name: 'Wiki Delas',
    source: 'postgres',
    aliases: ['mulher', 'wikidelas', 'wiki-delas', 'wiki_delas']
  },
  jornada: {
    name: 'Jornada Empreendedora',
    source: 'firestore',
    aliases: [
      'jornadaempreendedora', 'jornada-empreendedora', 'jornada_empreendedora',
      'sebrae'
    ]
  }
};

const EVENT_KEYS = Object.keys(EVENTS);

// Índice alias -> chave canônica, montado uma única vez
const ALIAS_INDEX = EVENT_KEYS.reduce((index, key) => {
  index[key] = key;
  for (const alias of EVENTS[key].aliases) {
    index[alias] = key;
  }
  return index;
}, {});

// Instância única da fonte Firestore (o Admin SDK é inicializado sob demanda)
const firestoreSource = createFirestoreSource();

/**
 * Cria a fonte de dados correspondente ao evento
 */
const getDataSource = (eventKey) => {
  if (EVENTS[eventKey].source === 'firestore') {
    return firestoreSource;
  }
  return createPostgresSource(getPool(eventKey));
};

/**
 * Middleware para identificar qual evento/base de dados deve ser utilizado
 * Verifica o query parameter 'event' ou header 'X-Event'
 *
 * Valores aceitos (ver EVENTS acima):
 * - 'recnplay' -> Rec'n'Play (padrão)
 * - 'global' ou 'globalcitizen' -> Global Citizen Festival Amazônia
 * - 'cop' -> COP
 * - 'sest' ou 'sestsenat' -> SEST SENAT COP 30
 * - 'southsummit' ou 'south-summit' -> South Summit
 * - 'rio2c' -> Rio2C
 * - 'mulheres' ou 'wikidelas' -> Wiki Delas
 * - 'jornada' ou 'jornada-empreendedora' -> Jornada Empreendedora (Firebase)
 */
const eventSelector = (req, res, next) => {
  // Verifica query parameter primeiro, depois header
  const received = req.query.event || req.headers['x-event'];

  // Normaliza o valor para lowercase
  const normalized = (received || 'recnplay').toLowerCase().trim();

  // Resolve aliases para a chave canônica do evento
  const event = ALIAS_INDEX[normalized];

  // Valida o evento
  if (!event) {
    return res.status(400).json({
      success: false,
      message: `Evento inválido. Use ${EVENT_KEYS.map((k) => `"${k}"`).join(', ')}`,
      receivedEvent: received
    });
  }

  // Adiciona o evento e a fonte de dados ao objeto request
  req.event = event;
  req.eventName = EVENTS[event].name;
  req.dataSource = getDataSource(event);

  // Mantém retrocompatibilidade para eventos em Postgres
  if (EVENTS[event].source === 'postgres') {
    req.dbPool = getPool(event);
  }

  // Log para debug
  console.log(`📊 Requisição para evento: ${req.eventName} (${event})`);

  next();
};

module.exports = eventSelector;
module.exports.EVENTS = EVENTS;
