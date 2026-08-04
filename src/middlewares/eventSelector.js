const { getPool } = require('../config/database');

/**
 * Middleware para identificar qual evento/base de dados deve ser utilizado
 * Verifica o query parameter 'event' ou header 'X-Event'
 *
 * Valores aceitos:
 * - 'recnplay' ou 'recnPlay' -> Rec'n'Play (padrão)
 * - 'global' ou 'globalcitizen' -> Global Citizen Festival Amazônia
 * - 'cop' -> COP
 * - 'sest' ou 'sestsenat' -> SEST SENAT COP 30
 * - 'southsummit' ou 'south-summit' -> South Summit
 * - 'rio2c' -> Rio2C
 * - 'mulheres' ou 'wikidelas' -> Wiki Delas
 */
const eventSelector = (req, res, next) => {
  // Verifica query parameter primeiro, depois header
  let event = req.query.event || req.headers['x-event'] || 'recnplay';

  // Normaliza o valor para lowercase
  event = event.toLowerCase().trim();

  // Mapeia variações para valores padrão
  if (event === 'globalcitizen' || event === 'global-citizen' || event === 'global_citizen') {
    event = 'global';
  } else if (event === 'recnplay' || event === 'rec-n-play' || event === 'rec_n_play') {
    event = 'recnplay';
  } else if (event === 'sestsenat' || event === 'sest-senat' || event === 'sest_senat') {
    event = 'sest';
  } else if (event === 'south-summit' || event === 'south_summit') {
    event = 'southsummit';
  } else if (event === 'rio-2c' || event === 'rio_2c' || event === 'rio2c') {
    event = 'rio2c';
  } else if (
    event === 'mulher' || event === 'mulheres' ||
    event === 'wikidelas' || event === 'wiki-delas' || event === 'wiki_delas'
  ) {
    event = 'mulheres';
  }

  // Valida o evento
  if (!['recnplay', 'global', 'cop', 'sest', 'southsummit', 'rio2c', 'mulheres'].includes(event)) {
    return res.status(400).json({
      success: false,
      message: 'Evento inválido. Use "recnplay", "global", "cop", "sest", "southsummit", "rio2c" ou "mulheres"',
      receivedEvent: req.query.event || req.headers['x-event']
    });
  }

  // Adiciona o evento e o pool ao objeto request
  req.event = event;
  req.dbPool = getPool(event);

  // Define o nome do evento
  if (event === 'global') {
    req.eventName = 'Global Citizen Festival Amazônia';
  } else if (event === 'cop') {
    req.eventName = 'COP';
  } else if (event === 'sest') {
    req.eventName = 'SEST SENAT COP 30';
  } else if (event === 'southsummit') {
    req.eventName = 'South Summit';
  } else if (event === 'rio2c') {
    req.eventName = 'Rio2C';
  } else if (event === 'mulheres') {
    req.eventName = 'Wiki Delas';
  } else {
    req.eventName = "Rec'n'Play";
  }

  // Log para debug
  console.log(`📊 Requisição para evento: ${req.eventName} (${event})`);

  next();
};

module.exports = eventSelector;
