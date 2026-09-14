/**
 * Fonte de dados PostgreSQL
 *
 * Implementa a interface comum de fonte de dados usada pelo dataController,
 * para que as mesmas rotas sirvam Postgres e Firestore.
 *
 * @param {object} pool   pool de conexões do evento
 * @param {string} schema schema onde estão os dados (o Supabase da Pesquisa
 *                        usa 'bi'; os bancos do Railway usam o padrão 'public')
 */
const createPostgresSource = (pool, schema = 'public') => {
  // O schema vem da configuração interna do evento, não do usuário, mas é
  // interpolado no SQL como identificador — vale a mesma disciplina aplicada
  // ao nome da tabela.
  if (!/^[a-zA-Z0-9_]+$/.test(schema)) {
    throw new Error(`Schema inválido: ${schema}`);
  }

  return {
    type: 'postgres',
    schema,

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
      // Cobre tabelas e views: information_schema.tables lista as duas
      const query = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = $1
        ORDER BY table_name;
      `;
      const result = await pool.query(query, [schema]);
      return result.rows;
    },

    async getTableData(tableName, limit, offset) {
      // Schema e tabela vão entre aspas duplas: sem elas o Postgres normaliza
      // o identificador para minúsculas e tabelas PascalCase (Prisma) não são
      // encontradas. Seguro porque schema e tableName já foram validados
      // contra [a-zA-Z0-9_].
      const dataResult = await pool.query(
        `SELECT * FROM "${schema}"."${tableName}" LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM "${schema}"."${tableName}"`
      );

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
          const dataResult = await pool.query(`SELECT * FROM "${schema}"."${tableName}"`);
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
  };
};

module.exports = createPostgresSource;
