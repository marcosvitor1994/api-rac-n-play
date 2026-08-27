const { pool } = require('../config/database');
const createPostgresSource = require('../services/postgresSource');

/**
 * Controller para gerenciar operações de dados
 *
 * As rotas são idênticas para todos os eventos. O que muda é a fonte de dados
 * (req.dataSource), definida pelo middleware eventSelector:
 *   - Postgres  -> tabelas e linhas
 *   - Firestore -> coleções e documentos
 */

// Fallback para chamadas que não passaram pelo middleware
const fallbackSource = createPostgresSource(pool);

const dataController = {

  /**
   * Busca todas as tabelas (ou coleções) do banco de dados
   * GET /api/tables
   */
  getAllTables: async (req, res) => {
    try {
      const source = req.dataSource || fallbackSource;
      const tables = await source.listTables();

      res.status(200).json({
        success: true,
        event: req.eventName || "Rec'n'Play",
        source: source.type,
        count: tables.length,
        data: tables
      });
    } catch (error) {
      console.error('Erro ao buscar tabelas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar tabelas do banco de dados',
        error: error.message
      });
    }
  },

  /**
   * Busca todos os dados de uma tabela específica
   * GET /api/data/:tableName
   */
  getTableData: async (req, res) => {
    try {
      const source = req.dataSource || fallbackSource;

      const { tableName } = req.params;
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;

      // Cada fonte valida o nome conforme suas próprias regras
      if (!source.validateTableName(tableName)) {
        return res.status(400).json({
          success: false,
          message: 'Nome de tabela inválido'
        });
      }

      const { total, rows } = await source.getTableData(tableName, limit, offset);

      res.status(200).json({
        success: true,
        event: req.eventName || "Rec'n'Play",
        source: source.type,
        table: tableName,
        total,
        count: rows.length,
        limit,
        offset,
        data: rows
      });
    } catch (error) {
      console.error('Erro ao buscar dados da tabela:', error);
      res.status(500).json({
        success: false,
        message: `Erro ao buscar dados da tabela: ${req.params.tableName}`,
        error: error.message
      });
    }
  },

  /**
   * Busca todos os dados de todas as tabelas
   * GET /api/data/all
   */
  getAllData: async (req, res) => {
    try {
      const source = req.dataSource || fallbackSource;

      const options = {};
      if (req.query.limit) {
        options.limit = parseInt(req.query.limit);
      }

      const allData = await source.getAllData(options);

      res.status(200).json({
        success: true,
        event: req.eventName || "Rec'n'Play",
        source: source.type,
        totalTables: Object.keys(allData).length,
        tables: allData
      });
    } catch (error) {
      console.error('Erro ao buscar todos os dados:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar todos os dados do banco',
        error: error.message
      });
    }
  },

  /**
   * Endpoint de health check
   * GET /api/health
   */
  healthCheck: async (req, res) => {
    try {
      const source = req.dataSource || fallbackSource;
      const timestamp = await source.health();

      res.status(200).json({
        success: true,
        event: req.eventName || "Rec'n'Play",
        source: source.type,
        message: 'API e banco de dados funcionando corretamente',
        timestamp
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        event: req.eventName,
        message: 'Erro na conexão com o banco de dados',
        error: error.message
      });
    }
  }
};

module.exports = dataController;
