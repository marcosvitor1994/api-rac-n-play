const { Pool } = require('pg');
require('dotenv').config();

/**
 * Remove o parâmetro sslmode da connection string.
 *
 * O `pg` interpreta `?sslmode=require` e o aplica por cima do objeto `ssl`
 * abaixo, o que faz a conexão falhar com "self-signed certificate in
 * certificate chain" (é o caso das strings que o Supabase entrega pronto).
 * Como todos os pools daqui já definem explicitamente o modo de SSL, o
 * parâmetro é redundante — e removê-lo evita que a string copiada do painel
 * do provedor quebre a conexão, aqui ou nas variáveis de ambiente do Vercel.
 *
 * Não tem efeito nas strings do Railway, que não trazem esse parâmetro.
 */
const sanitizeConnectionString = (url) => {
  if (!url) return url;
  return url
    .replace(/([?&])sslmode=[^&]*&?/g, '$1')
    .replace(/[?&]$/, '');
};

// Configuração do Pool de Conexões - Rec'n'Play
const poolRecNPlay = new Pool({
  connectionString: sanitizeConnectionString(process.env.DATABASE_URL),
  ssl: {
    rejectUnauthorized: false // Necessário para conexões Railway
  },
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000, // Tempo de espera antes de fechar cliente inativo
  connectionTimeoutMillis: 2000, // Tempo de espera para estabelecer conexão
});

// Configuração do Pool de Conexões - Global Citizen Festival Amazônia
const poolGlobal = new Pool({
  connectionString: sanitizeConnectionString(process.env.DATABASE_URL_GLOBAL),
  ssl: {
    rejectUnauthorized: false // Necessário para conexões Railway
  },
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000, // Tempo de espera antes de fechar cliente inativo
  connectionTimeoutMillis: 2000, // Tempo de espera para estabelecer conexão
});

// Configuração do Pool de Conexões - COP
const poolCOP = new Pool({
  connectionString: sanitizeConnectionString(process.env.DATABASE_URL_COP),
  ssl: {
    rejectUnauthorized: false // Necessário para conexões Railway
  },
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000, // Tempo de espera antes de fechar cliente inativo
  connectionTimeoutMillis: 2000, // Tempo de espera para estabelecer conexão
});

// Configuração do Pool de Conexões - SEST SENAT COP 30
const poolSEST = new Pool({
  connectionString: sanitizeConnectionString(process.env.DATABASE_URL_SEST),
  ssl: {
    rejectUnauthorized: false // Necessário para conexões Railway
  },
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000, // Tempo de espera antes de fechar cliente inativo
  connectionTimeoutMillis: 2000, // Tempo de espera para estabelecer conexão
});

// Configuração do Pool de Conexões - South Summit
const poolSouthSummit = new Pool({
  connectionString: sanitizeConnectionString(process.env.DATABASE_URL_SOUTHSUMMIT),
  ssl: {
    rejectUnauthorized: false // Necessário para conexões Railway
  },
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000, // Tempo de espera antes de fechar cliente inativo
  connectionTimeoutMillis: 2000, // Tempo de espera para estabelecer conexão
});

// Configuração do Pool de Conexões - Rio2C
const poolRio2C = new Pool({
  connectionString: sanitizeConnectionString(process.env.DATABASE_URL_RIO2C),
  ssl: {
    rejectUnauthorized: false // Necessário para conexões Railway
  },
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000, // Tempo de espera antes de fechar cliente inativo
  connectionTimeoutMillis: 2000, // Tempo de espera para estabelecer conexão
});

// Configuração do Pool de Conexões - Wiki Delas
const poolMulheres = new Pool({
  connectionString: sanitizeConnectionString(process.env.DATABASE_URL_MULHERES),
  ssl: {
    rejectUnauthorized: false // Necessário para conexões Railway
  },
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000, // Tempo de espera antes de fechar cliente inativo
  connectionTimeoutMillis: 2000, // Tempo de espera para estabelecer conexão
});

// Configuração do Pool de Conexões - Pesquisa (Supabase)
const poolPesquisa = new Pool({
  connectionString: sanitizeConnectionString(process.env.DATABASE_URL_PESQUISA),
  ssl: {
    rejectUnauthorized: false // O pooler do Supabase usa certificado próprio
  },
  // O pooler do Supabase tem um limite de conexões bem menor que o Railway,
  // e em serverless cada instância abre o seu próprio pool
  max: 5,
  idleTimeoutMillis: 30000, // Tempo de espera antes de fechar cliente inativo
  connectionTimeoutMillis: 10000, // Pooler externo demora mais que o Railway
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

// Event listeners para monitoramento - South Summit
poolSouthSummit.on('connect', () => {
  console.log('✅ [South Summit] Nova conexão estabelecida com o banco de dados');
});

poolSouthSummit.on('error', (err) => {
  console.error('❌ [South Summit] Erro inesperado no pool de conexões:', err);
});

// Event listeners para monitoramento - Rio2C
poolRio2C.on('connect', () => {
  console.log('✅ [Rio2C] Nova conexão estabelecida com o banco de dados');
});

poolRio2C.on('error', (err) => {
  console.error('❌ [Rio2C] Erro inesperado no pool de conexões:', err);
});

// Event listeners para monitoramento - Wiki Delas
poolMulheres.on('connect', () => {
  console.log('✅ [Wiki Delas] Nova conexão estabelecida com o banco de dados');
});

poolMulheres.on('error', (err) => {
  console.error('❌ [Wiki Delas] Erro inesperado no pool de conexões:', err);
});

// Event listeners para monitoramento - Pesquisa
poolPesquisa.on('connect', () => {
  console.log('✅ [Pesquisa] Nova conexão estabelecida com o banco de dados');
});

poolPesquisa.on('error', (err) => {
  console.error('❌ [Pesquisa] Erro inesperado no pool de conexões:', err);
});

// Função para obter o pool correto baseado no evento
const getPool = (event = 'recnplay') => {
  if (event === 'global') {
    return poolGlobal;
  } else if (event === 'cop') {
    return poolCOP;
  } else if (event === 'sest') {
    return poolSEST;
  } else if (event === 'southsummit') {
    return poolSouthSummit;
  } else if (event === 'rio2c') {
    return poolRio2C;
  } else if (event === 'mulheres') {
    return poolMulheres;
  } else if (event === 'pesquisa') {
    return poolPesquisa;
  }
  return poolRecNPlay;
};

// Função para testar a conexão de todos os pools
const testConnection = async () => {
  const results = {
    recnplay: false,
    global: false,
    cop: false,
    sest: false,
    southsummit: false,
    rio2c: false,
    mulheres: false,
    pesquisa: false
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

  try {
    const clientSouthSummit = await poolSouthSummit.connect();
    console.log('🔌 [South Summit] Conexão com PostgreSQL estabelecida com sucesso!');
    clientSouthSummit.release();
    results.southsummit = true;
  } catch (error) {
    console.error('❌ [South Summit] Erro ao conectar com o banco de dados:', error.message);
  }

  try {
    const clientRio2C = await poolRio2C.connect();
    console.log('🔌 [Rio2C] Conexão com PostgreSQL estabelecida com sucesso!');
    clientRio2C.release();
    results.rio2c = true;
  } catch (error) {
    console.error('❌ [Rio2C] Erro ao conectar com o banco de dados:', error.message);
  }

  try {
    const clientMulheres = await poolMulheres.connect();
    console.log('🔌 [Wiki Delas] Conexão com PostgreSQL estabelecida com sucesso!');
    clientMulheres.release();
    results.mulheres = true;
  } catch (error) {
    console.error('❌ [Wiki Delas] Erro ao conectar com o banco de dados:', error.message);
  }

  try {
    const clientPesquisa = await poolPesquisa.connect();
    console.log('🔌 [Pesquisa] Conexão com PostgreSQL estabelecida com sucesso!');
    clientPesquisa.release();
    results.pesquisa = true;
  } catch (error) {
    console.error('❌ [Pesquisa] Erro ao conectar com o banco de dados:', error.message);
  }

  return results;
};

module.exports = {
  poolRecNPlay,
  poolGlobal,
  poolCOP,
  poolSEST,
  poolSouthSummit,
  poolRio2C,
  poolMulheres,
  poolPesquisa,
  getPool,
  testConnection,
  sanitizeConnectionString,
  // Mantém retrocompatibilidade
  pool: poolRecNPlay
};