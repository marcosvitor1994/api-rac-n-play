const { Pool } = require('pg');
require('dotenv').config();

// Configuração do Pool de Conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessário para conexões Railway
  },
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000, // Tempo de espera antes de fechar cliente inativo
  connectionTimeoutMillis: 2000, // Tempo de espera para estabelecer conexão
});

// Event listeners para monitoramento
pool.on('connect', () => {
  console.log('✅ Nova conexão estabelecida com o banco de dados');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool de conexões:', err);
  process.exit(-1);
});

// Função para testar a conexão
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('🔌 Conexão com PostgreSQL estabelecida com sucesso!');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};