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
  }

  // Valida o evento
  if (!['recnplay', 'global', 'cop', 'sest'].includes(event)) {
    return res.status(400).json({
      success: false,
      message: 'Evento inválido. Use "recnplay", "global", "cop" ou "sest"',
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
  } else {
    req.eventName = "Rec'n'Play";
  }

  // Log para debug
  console.log(`📊 Requisição para evento: ${req.eventName} (${event})`);

  next();
};

module.exports = eventSelector;
