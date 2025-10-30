const { pool } = require('../config/database');

/**
 * Controller para gerenciar operações de dados
 */
const dataController = {

  /**
   * Busca todas as tabelas do banco de dados
   * GET /api/tables
   */
  getAllTables: async (req, res) => {
    try {
      // Usa o pool do evento selecionado (vem do middleware)
      const dbPool = req.dbPool || pool;

      const query = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;

      const result = await dbPool.query(query);
      
      res.status(200).json({
        success: true,
        event: req.eventName || "Rec'n'Play",
        count: result.rows.length,
        data: result.rows
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
      // Usa o pool do evento selecionado (vem do middleware)
      const dbPool = req.dbPool || pool;

      const { tableName } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      // Validação simples do nome da tabela
      if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return res.status(400).json({
          success: false,
          message: 'Nome de tabela inválido'
        });
      }

      // Busca os dados com paginação
      const dataQuery = `SELECT * FROM ${tableName} LIMIT $1 OFFSET $2`;
      const dataResult = await dbPool.query(dataQuery, [limit, offset]);

      // Busca o total de registros
      const countQuery = `SELECT COUNT(*) FROM ${tableName}`;
      const countResult = await dbPool.query(countQuery);

      res.status(200).json({
        success: true,
        event: req.eventName || "Rec'n'Play",
        table: tableName,
        total: parseInt(countResult.rows[0].count),
        count: dataResult.rows.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        data: dataResult.rows
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
      // Usa o pool do evento selecionado (vem do middleware)
      const dbPool = req.dbPool || pool;

      // Primeiro, busca todas as tabelas
      const tablesQuery = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;

      const tablesResult = await dbPool.query(tablesQuery);
      const allData = {};

      // Para cada tabela, busca todos os dados
      for (const table of tablesResult.rows) {
        const tableName = table.table_name;
        try {
          const dataQuery = `SELECT * FROM ${tableName}`;
          const dataResult = await dbPool.query(dataQuery);
          allData[tableName] = {
            count: dataResult.rows.length,
            data: dataResult.rows
          };
        } catch (error) {
          console.error(`Erro ao buscar dados da tabela ${tableName}:`, error);
          allData[tableName] = {
            error: error.message
          };
        }
      }

      res.status(200).json({
        success: true,
        event: req.eventName || "Rec'n'Play",
        totalTables: tablesResult.rows.length,
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
      // Usa o pool do evento selecionado (vem do middleware)
      const dbPool = req.dbPool || pool;

      const result = await dbPool.query('SELECT NOW()');
      res.status(200).json({
        success: true,
        event: req.eventName || "Rec'n'Play",
        message: 'API e banco de dados funcionando corretamente',
        timestamp: result.rows[0].now
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        message: 'Erro na conexão com o banco de dados',
        error: error.message
      });
    }
  }
};

module.exports = dataController;