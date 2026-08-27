// firebase-admin v14 expõe a API modular: `cert`/`initializeApp` vêm de
// 'firebase-admin/app' e os serviços de seus próprios subcaminhos.
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore: getFirestoreForApp } = require('firebase-admin/firestore');
const { getAuth: getAuthForApp } = require('firebase-admin/auth');
require('dotenv').config();

// Nome do app dedicado ao evento (não interfere no app default)
const APP_NAME = 'jornada';

/**
 * Configuração do Firebase Admin SDK - Jornada Empreendedora (SEBRAE)
 *
 * IMPORTANTE: as variáveis APIKEY/AUTHDOMAIN/APPID do .env são credenciais do
 * SDK *client* (web). Elas não dão acesso de leitura a partir de um backend:
 * as security rules do projeto bloqueiam qualquer leitura anônima.
 * Para a API ler os dados é necessária uma *service account* (Admin SDK),
 * que ignora as security rules.
 *
 * Console Firebase > Configurações do projeto > Contas de serviço >
 * "Gerar nova chave privada" (baixa um JSON).
 *
 * Aceita qualquer um destes formatos no .env:
 *   1) FIREBASE_SERVICE_ACCOUNT_BASE64=<json da service account em base64>
 *   2) FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}  (JSON em uma linha)
 *   3) FIREBASE_CLIENT_EMAIL=... e FIREBASE_PRIVATE_KEY=...
 */

// Remove chaves {} que envolvem o valor (o .env usa esse formato em APPID)
// Atenção: não use em valores JSON — um JSON também começa com { e termina com }
const clean = (value) => {
  if (!value) return value;
  return value.trim().replace(/^\{(.*)\}$/s, '$1').trim();
};

// Faz o parse de um JSON que pode (ou não) estar envolto em chaves extras
const parseJsonEnv = (value, label) => {
  const trimmed = value.trim();
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    // Só então tenta remover um par de chaves externas do estilo APPID={...}
    try {
      return JSON.parse(clean(trimmed));
    } catch (innerError) {
      console.error(`❌ [Jornada] ${label} não é um JSON válido:`, error.message);
      return null;
    }
  }
};

/**
 * Monta o objeto de credencial a partir das variáveis de ambiente disponíveis
 * @returns {object|null} credenciais ou null se não estiverem configuradas
 */
const resolveServiceAccount = () => {
  const base64 = clean(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64);
  if (base64) {
    try {
      return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
    } catch (error) {
      console.error('❌ [Jornada] FIREBASE_SERVICE_ACCOUNT_BASE64 inválido:', error.message);
      return null;
    }
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw && raw.trim()) {
    return parseJsonEnv(raw, 'FIREBASE_SERVICE_ACCOUNT');
  }

  const clientEmail = clean(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKey = clean(process.env.FIREBASE_PRIVATE_KEY);
  const projectId = clean(process.env.FIREBASE_PROJECT_ID) || clean(process.env.PROJECTID);

  if (clientEmail && privateKey && projectId) {
    return {
      project_id: projectId,
      client_email: clientEmail,
      // Chaves coladas no .env vêm com \n literal em vez de quebra de linha
      private_key: privateKey.replace(/\\n/g, '\n')
    };
  }

  return null;
};

let firebaseApp = null;
let initError = null;

/**
 * Inicializa (uma única vez) o app do Firebase Admin
 * @returns {object|null} app inicializado ou null se não houver credenciais
 */
const initFirebase = () => {
  if (firebaseApp || initError) return firebaseApp;

  const serviceAccount = resolveServiceAccount();

  if (!serviceAccount) {
    initError = new Error(
      'Credenciais do Firebase Admin não configuradas. Defina FIREBASE_SERVICE_ACCOUNT_BASE64, ' +
      'FIREBASE_SERVICE_ACCOUNT ou FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY no .env. ' +
      'As variáveis APIKEY/APPID são do SDK client e não permitem leitura pelo backend.'
    );
    console.warn(`⚠️  [Jornada Empreendedora] ${initError.message}`);
    return null;
  }

  try {
    // Reaproveita o app se ele já tiver sido criado (evita erro de app duplicado)
    const existing = getApps().find((app) => app.name === APP_NAME);
    if (existing) {
      firebaseApp = existing;
      return firebaseApp;
    }

    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || serviceAccount.projectId || clean(process.env.PROJECTID),
      storageBucket: clean(process.env.STORAGEBUCKET)
    }, APP_NAME);

    console.log('✅ [Jornada Empreendedora] Firebase Admin inicializado');
    return firebaseApp;
  } catch (error) {
    initError = error;
    console.error('❌ [Jornada Empreendedora] Erro ao inicializar Firebase Admin:', error.message);
    return null;
  }
};

/**
 * Retorna a instância do Firestore, ou lança erro explicando o que falta
 */
const getFirestore = () => {
  const app = initFirebase();
  if (!app) {
    throw initError || new Error('Firebase não inicializado');
  }
  return getFirestoreForApp(app);
};

/**
 * Retorna a instância do Firebase Auth, ou lança erro explicando o que falta
 */
const getAuth = () => {
  const app = initFirebase();
  if (!app) {
    throw initError || new Error('Firebase não inicializado');
  }
  return getAuthForApp(app);
};

/**
 * Indica se as credenciais de Admin estão configuradas (sem lançar erro)
 */
const isConfigured = () => resolveServiceAccount() !== null;

/**
 * Testa a conexão com o Firestore
 */
const testFirebaseConnection = async () => {
  if (!isConfigured()) {
    console.warn('⚠️  [Jornada Empreendedora] Sem credenciais de service account — evento indisponível');
    return false;
  }

  try {
    const db = getFirestore();
    await db.listCollections();
    console.log('🔌 [Jornada Empreendedora] Conexão com Firestore estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ [Jornada Empreendedora] Erro ao conectar com o Firestore:', error.message);
    return false;
  }
};

module.exports = {
  initFirebase,
  getFirestore,
  getAuth,
  isConfigured,
  testFirebaseConnection
};
