const { Pool } = require('pg');
require('dotenv').config();

// Configuração do Pool de Conexões - Rec'n'Play
const poolRecNPlay = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessário para conexões Railway
  },
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000, // Tempo de espera antes de fechar cliente inativo
  connectionTimeoutMillis: 2000, // Tempo de espera para estabelecer conexão
});

// Configuração do Pool de Conexões - Global Citizen Festival Amazônia
const poolGlobal = new Pool({
  connectionString: process.env.DATABASE_URL_GLOBAL,
  ssl: {
    rejectUnauthorized: false // Necessário para conexões Railway
  },
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000, // Tempo de espera antes de fechar cliente inativo
  connectionTimeoutMillis: 2000, // Tempo de espera para estabelecer conexão
});

// Configuração do Pool de Conexões - COP
const poolCOP = new Pool({
  connectionString: process.env.DATABASE_URL_COP,
  ssl: {
    rejectUnauthorized: false // Necessário para conexões Railway
  },
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000, // Tempo de espera antes de fechar cliente inativo
  connectionTimeoutMillis: 2000, // Tempo de espera para estabelecer conexão
});

// Configuração do Pool de Conexões - SEST SENAT COP 30
const poolSEST = new Pool({
  connectionString: process.env.DATABASE_URL_SEST,
  ssl: {
    rejectUnauthorized: false // Necessário para conexões Railway
  },
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000, // Tempo de espera antes de fechar cliente inativo
  connectionTimeoutMillis: 2000, // Tempo de espera para estabelecer conexão
});

// Event listeners para monitoramento - Rec'n'Play
poolRecNPlay.on('connect', () => {
  console.log('✅ [Rec\'n\'Play] Nova conexão estabelecida com o banco de dados');
});

poolRecNPlay.on('error', (err) => {
  console.error('❌ [Rec\'n\'Play] Erro inesperado no pool de conexões:', err);
});

// Event listeners para monitoramento - Global Citizen
poolGlobal.on('connect', () => {
  console.log('✅ [Global Citizen] Nova conexão estabelecida com o banco de dados');
});

poolGlobal.on('error', (err) => {
  console.error('❌ [Global Citizen] Erro inesperado no pool de conexões:', err);
});

// Event listeners para monitoramento - COP
poolCOP.on('connect', () => {
  console.log('✅ [COP] Nova conexão estabelecida com o banco de dados');
});

poolCOP.on('error', (err) => {
  console.error('❌ [COP] Erro inesperado no pool de conexões:', err);
});

// Event listeners para monitoramento - SEST SENAT
poolSEST.on('connect', () => {
  console.log('✅ [SEST SENAT] Nova conexão estabelecida com o banco de dados');
});

poolSEST.on('error', (err) => {
  console.error('❌ [SEST SENAT] Erro inesperado no pool de conexões:', err);
});

// Função para obter o pool correto baseado no evento
const getPool = (event = 'recnplay') => {
  if (event === 'global') {
    return poolGlobal;
  } else if (event === 'cop') {
    return poolCOP;
  } else if (event === 'sest') {
    return poolSEST;
  }
  return poolRecNPlay;
};

// Função para testar a conexão de todos os pools
const testConnection = async () => {
  const results = {
    recnplay: false,
    global: false,
    cop: false,
    sest: false
  };

  try {
    const clientRecNPlay = await poolRecNPlay.connect();
    console.log('🔌 [Rec\'n\'Play] Conexão com PostgreSQL estabelecida com sucesso!');
    clientRecNPlay.release();
    results.recnplay = true;
  } catch (error) {
    console.error('❌ [Rec\'n\'Play] Erro ao conectar com o banco de dados:', error.message);
  }

  try {
    const clientGlobal = await poolGlobal.connect();
    console.log('🔌 [Global Citizen] Conexão com PostgreSQL estabelecida com sucesso!');
    clientGlobal.release();
    results.global = true;
  } catch (error) {
    console.error('❌ [Global Citizen] Erro ao conectar com o banco de dados:', error.message);
  }

  try {
    const clientCOP = await poolCOP.connect();
    console.log('🔌 [COP] Conexão com PostgreSQL estabelecida com sucesso!');
    clientCOP.release();
    results.cop = true;
  } catch (error) {
    console.error('❌ [COP] Erro ao conectar com o banco de dados:', error.message);
  }

  try {
    const clientSEST = await poolSEST.connect();
    console.log('🔌 [SEST SENAT] Conexão com PostgreSQL estabelecida com sucesso!');
    clientSEST.release();
    results.sest = true;
  } catch (error) {
    console.error('❌ [SEST SENAT] Erro ao conectar com o banco de dados:', error.message);
  }

  return results;
};

module.exports = {
  poolRecNPlay,
  poolGlobal,
  poolCOP,
  poolSEST,
  getPool,
  testConnection,
  // Mantém retrocompatibilidade
  pool: poolRecNPlay
};