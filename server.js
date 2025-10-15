require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

/**
 * Inicia o servidor
 */
const startServer = async () => {
  try {
    // Testa a conexão com o banco de dados
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Falha ao conectar com o banco de dados. Servidor não iniciado.');
      process.exit(1);
    }

    // Inicia o servidor Express
    app.listen(PORT, () => {
      console.log('\n========================================');
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log('========================================\n');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado (Rejection):', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Erro não tratado (Exception):', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});

// Inicia o servidor
startServer();