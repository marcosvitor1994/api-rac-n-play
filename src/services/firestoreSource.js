const { getFirestore, getAuth } = require('../config/firebase');

/**
 * Fonte de dados Firestore (Firebase)
 *
 * Implementa a mesma interface do postgresSource, mapeando:
 *   tabela  -> coleção
 *   linha   -> documento (o id do documento vai no campo `_id`)
 *
 * Extras:
 *   - pseudo-coleção `_auth_users` expõe os usuários do Firebase Authentication
 *   - subcoleções podem ser acessadas usando `~` como separador,
 *     ex: /api/data/users~abc123~pedidos
 */

// Pseudo-coleção que expõe os usuários do Firebase Authentication
const AUTH_USERS = '_auth_users';

// Teto de documentos por coleção em /data/all (Firestore cobra por leitura)
const DEFAULT_ALL_LIMIT = 1000;

/**
 * Converte tipos nativos do Firestore para algo serializável em JSON
 */
const serializeValue = (value) => {
  if (value === null || value === undefined) return value;

  // Timestamp do Firestore
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) return value.toISOString();
  if (Buffer.isBuffer(value)) return value.toString('base64');

  // GeoPoint
  if (typeof value.latitude === 'number' && typeof value.longitude === 'number') {
    return { latitude: value.latitude, longitude: value.longitude };
  }

  // DocumentReference
  if (value.firestore && typeof value.path === 'string') {
    return value.path;
  }

  if (Array.isArray(value)) return value.map(serializeValue);

  if (typeof value === 'object') {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = serializeValue(item);
    }
    return out;
  }

  return value;
};

/**
 * Converte um snapshot de documento em um objeto plano
 */
const serializeDoc = (doc) => ({
  _id: doc.id,
  ...serializeValue(doc.data() || {})
});

/**
 * Converte um usuário do Firebase Auth em objeto plano
 */
const serializeUser = (user) => ({
  _id: user.uid,
  uid: user.uid,
  email: user.email || null,
  emailVerified: user.emailVerified,
  displayName: user.displayName || null,
  phoneNumber: user.phoneNumber || null,
  photoURL: user.photoURL || null,
  disabled: user.disabled,
  createdAt: user.metadata?.creationTime || null,
  lastSignInAt: user.metadata?.lastSignInTime || null,
  providers: (user.providerData || []).map((p) => p.providerId),
  customClaims: user.customClaims || null
});

/**
 * Resolve o caminho da coleção, aceitando `~` como separador de subcoleções
 */
const resolveCollection = (db, tableName) => {
  const segments = tableName.split('~').filter(Boolean);
  return db.collection(segments.join('/'));
};

/**
 * Lista todos os usuários do Firebase Auth (páginas de 1000)
 */
const listAuthUsers = async (limit = Infinity) => {
  const auth = getAuth();
  const users = [];
  let pageToken;

  do {
    const result = await auth.listUsers(1000, pageToken);
    users.push(...result.users.map(serializeUser));
    pageToken = result.pageToken;
  } while (pageToken && users.length < limit);

  return users;
};

const createFirestoreSource = () => ({
  type: 'firestore',

  /**
   * Nomes de coleção do Firestore aceitam mais caracteres que tabelas SQL.
   * Aqui não há risco de injection (não há string de query montada),
   * então a validação apenas barra caminhos malformados.
   */
  validateTableName(tableName) {
    if (!tableName || tableName.length > 200) return false;
    if (tableName.includes('/') || tableName.includes('..')) return false;
    // Um caminho de coleção tem número ímpar de segmentos (col, col/doc/col, ...)
    const segments = tableName.split('~').filter(Boolean);
    if (segments.length % 2 === 0) return false;
    return /^[a-zA-Z0-9_\-.~]+$/.test(tableName);
  },

  async health() {
    const db = getFirestore();
    await db.listCollections();
    return new Date().toISOString();
  },

  async listTables() {
    const db = getFirestore();
    const collections = await db.listCollections();
    const tables = collections.map((col) => ({ table_name: col.id }));

    // Expõe os usuários do Authentication como uma coleção adicional
    tables.push({ table_name: AUTH_USERS });

    return tables.sort((a, b) => a.table_name.localeCompare(b.table_name));
  },

  async getTableData(tableName, limit, offset) {
    if (tableName === AUTH_USERS) {
      const all = await listAuthUsers();
      return {
        total: all.length,
        rows: all.slice(offset, offset + limit)
      };
    }

    const db = getFirestore();
    const collection = resolveCollection(db, tableName);

    const snapshot = await collection.limit(limit).offset(offset).get();
    const rows = snapshot.docs.map(serializeDoc);

    // count() é uma agregação no servidor — não lê os documentos
    let total = offset + rows.length;
    try {
      const countSnapshot = await collection.count().get();
      total = countSnapshot.data().count;
    } catch (error) {
      console.warn(`[Jornada] count() indisponível em ${tableName}:`, error.message);
    }

    return { total, rows };
  },

  async getAllData(options = {}) {
    const limit = options.limit || DEFAULT_ALL_LIMIT;
    const db = getFirestore();
    const collections = await db.listCollections();
    const allData = {};

    for (const collection of collections) {
      try {
        const snapshot = await collection.limit(limit).get();
        const data = snapshot.docs.map(serializeDoc);

        allData[collection.id] = {
          count: data.length,
          // Sinaliza quando a coleção foi truncada pelo teto de leitura
          truncated: data.length === limit,
          data
        };
      } catch (error) {
        console.error(`Erro ao buscar dados da coleção ${collection.id}:`, error);
        allData[collection.id] = { error: error.message };
      }
    }

    try {
      const users = await listAuthUsers();
      allData[AUTH_USERS] = { count: users.length, truncated: false, data: users };
    } catch (error) {
      console.error('Erro ao listar usuários do Firebase Auth:', error);
      allData[AUTH_USERS] = { error: error.message };
    }

    return allData;
  }
});

module.exports = createFirestoreSource;
