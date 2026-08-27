/**
 * Fonte de dados PostgreSQL
 *
 * Implementa a interface comum de fonte de dados usada pelo dataController,
 * para que as mesmas rotas sirvam Postgres e Firestore.
 */
const createPostgresSource = (pool) => ({
  type: 'postgres',

  /**
   * Valida o nome da tabela.
   * A validação é estrita porque o nome é interpolado direto no SQL
   * (identificadores não podem ser parametrizados) — é a proteção
   * contra SQL injection.
   */
  validateTableName(tableName) {
    return /^[a-zA-Z0-9_]+$/.test(tableName);
  },

  async health() {
    const result = await pool.query('SELECT NOW()');
    return result.rows[0].now;
  },

  async listTables() {
    const query = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async getTableData(tableName, limit, offset) {
    // O nome vai entre aspas duplas: sem elas o Postgres normaliza o
    // identificador para minúsculas e tabelas PascalCase (Prisma) não
    // são encontradas. Seguro porque validateTableName já restringiu
    // o nome a [a-zA-Z0-9_].
    const dataResult = await pool.query(
      `SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countResult = await pool.query(`SELECT COUNT(*) FROM "${tableName}"`);

    return {
      total: parseInt(countResult.rows[0].count),
      rows: dataResult.rows
    };
  },

  async getAllData() {
    const tables = await this.listTables();
    const allData = {};

    for (const table of tables) {
      const tableName = table.table_name;
      try {
        const dataResult = await pool.query(`SELECT * FROM "${tableName}"`);
        allData[tableName] = {
          count: dataResult.rows.length,
          data: dataResult.rows
        };
      } catch (error) {
        console.error(`Erro ao buscar dados da tabela ${tableName}:`, error);
        allData[tableName] = { error: error.message };
      }
    }

    return allData;
  }
});

module.exports = createPostgresSource;
