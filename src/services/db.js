// src/services/db.js
// Camada de dados híbrida: funciona instantaneamente em Modo Local (localStorage)
// com todos os dados de exemplo pré-carregados, e migra automaticamente para o Firebase
// caso credenciais válidas sejam configuradas no .env.

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword as fbCreateUser,
  signInWithEmailAndPassword as fbSignIn,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection as fbCollection,
  doc as fbDoc,
  getDoc as fbGetDoc,
  getDocs as fbGetDocs,
  setDoc as fbSetDoc,
  addDoc as fbAddDoc,
  updateDoc as fbUpdateDoc,
  deleteDoc as fbDeleteDoc,
  onSnapshot as fbOnSnapshot,
  query as fbQuery,
  where as fbWhere,
  orderBy as fbOrderBy,
  limit as fbLimit,
  serverTimestamp as fbServerTimestamp
} from 'firebase/firestore';
import {
  getStorage,
  ref as fbRef,
  uploadBytes as fbUploadBytes,
  getDownloadURL as fbGetDownloadURL
} from 'firebase/storage';

// ── Verificação de Firebase Real ───────────────────────────────────────────
const rawKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
export const isFirebaseConfigured =
  Boolean(rawKey) &&
  rawKey !== 'AIzaSyDEMO_SUBSTITUA_AQUI' &&
  rawKey !== 'SEU_API_KEY' &&
  !rawKey.includes('SUBSTITUA');

let fbApp = null;
let fbAuthInstance = null;
let fbDbInstance = null;
let fbStorageInstance = null;

if (isFirebaseConfigured) {
  try {
    fbApp = initializeApp({
      apiKey: rawKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    });
    fbAuthInstance = getAuth(fbApp);
    fbDbInstance = getFirestore(fbApp);
    fbStorageInstance = getStorage(fbApp);
  } catch (err) {
    console.warn('Erro ao inicializar Firebase real, alternando para LocalStore:', err);
  }
}

// ── SEED INICIAL (Modo Local) ─────────────────────────────────────────────
const SEED_DATA = {
  usuarios: {
    user_admin: {
      id: 'user_admin',
      nome: 'admin',
      senha: 'cowboy2024',
      role: 'admin',
      createdAt: '2026-10-31T10:00:00.000Z'
    },
    user_jessica: {
      id: 'user_jessica',
      nome: 'jessica_lima',
      senha: 'senha123',
      role: 'aluno',
      createdAt: '2026-10-31T11:00:00.000Z'
    },
    user_rafael: {
      id: 'user_rafael',
      nome: 'rafael_costa',
      senha: 'senha123',
      role: 'aluno',
      createdAt: '2026-10-31T12:00:00.000Z'
    },
    user_marina: {
      id: 'user_marina',
      nome: 'marina_souza',
      senha: 'senha123',
      role: 'aluno',
      createdAt: '2026-10-31T13:00:00.000Z'
    }
  },
  modelos: {
    user_jessica: {
      id: 'user_jessica',
      userId: 'user_jessica',
      nome: 'Sofia Mendes',
      idade: 24,
      trabalho: 'Arquiteta & Fotógrafa',
      hobby: 'Cafés especiais & Urban Sketch',
      subnicho: 'Lifestyle Urbano & Minimalismo',
      descricao: 'Exploro ângulos escondidos da cidade, design brutalista e rotinas produtivas com estética minimalista.',
      fotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      createdAt: '2026-10-31T11:15:00.000Z',
      updatedAt: '2026-10-31T11:15:00.000Z'
    },
    user_rafael: {
      id: 'user_rafael',
      userId: 'user_rafael',
      nome: 'Lara Vieira',
      idade: 22,
      trabalho: 'Designer UX & Atleta Amadora',
      hobby: 'Yoga ao ar livre & Corrida de Rua',
      subnicho: 'Fitness & Bem-estar Feminino',
      descricao: 'Compartilha rotinas matutinas de alta energia, hábitos alimentares saudáveis e treinos para mulheres ocupadas.',
      fotoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      createdAt: '2026-10-31T12:15:00.000Z',
      updatedAt: '2026-10-31T12:15:00.000Z'
    }
  },
  pedidos_ajuda: {
    pedido_1: {
      id: 'pedido_1',
      userId: 'user_rafael',
      nomeAluno: 'rafael_costa',
      modeloId: 'user_rafael',
      nomeModelo: 'Lara Vieira',
      topico: 'Como planejar a primeira sequência de 5 Stories para aquecer o perfil e reter novas seguidoras?',
      status: 'Pendente',
      createdAt: '2026-10-31T14:30:00.000Z'
    }
  },
  notificacoes: {
    notif_1: {
      id: 'notif_1',
      adminId: 'user_admin',
      tipo: 'pedido_ajuda',
      pedidoId: 'pedido_1',
      nomeAluno: 'rafael_costa',
      topico: 'Como planejar a primeira sequência de 5 Stories para aquecer o perfil e reter novas seguidoras?',
      lida: false,
      createdAt: '2026-10-31T14:30:00.000Z'
    }
  },
  curiosidades: {
    curio_1: {
      id: 'curio_1',
      titulo: 'Por que a Bio do Perfil é Decisiva?',
      corpo: 'A bio é o seu cartão de visitas de 3 segundos. Ela precisa responder com clareza: quem é você, para quem você fala e o que a pessoa ganha te acompanhando. Use palavras-chave do nicho e uma chamada clara para ação (CTA).',
      createdAt: '2026-10-31T09:00:00.000Z'
    },
    curio_2: {
      id: 'curio_2',
      titulo: 'Consistência > Perfeição',
      corpo: 'Publicar 3 a 4 vezes por semana de forma disciplinada entrega 5x mais alcance orgânico do que esperar o post "perfeito" a cada 15 dias. O algoritmo premia a frequência e retenção diária nos stories.',
      createdAt: '2026-10-31T09:30:00.000Z'
    },
    curio_3: {
      id: 'curio_3',
      titulo: 'Conexão Real no Subnicho',
      corpo: 'Modelos com hobbies autênticos e rotinas reais geram 3x mais resposta em caixas de perguntas e DMs do que perfis meramente estéticos sem personalidade.',
      createdAt: '2026-10-31T10:00:00.000Z'
    }
  },
  perfis_inspiracao: {
    insp_1: {
      id: 'insp_1',
      nome: 'Matilda Djerf',
      fotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      link: 'https://instagram.com',
      motivo: 'Referência em estética natural (effortless chic), criando comunidade altamente fiel através de narrativa visual leve.',
      createdAt: '2026-10-31T09:15:00.000Z'
    },
    insp_2: {
      id: 'insp_2',
      nome: 'Sanja V.',
      fotoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      link: 'https://instagram.com',
      motivo: 'Domínio de iluminação urbana e narrativa em carrosséis com alta taxa de salvamento.',
      createdAt: '2026-10-31T09:45:00.000Z'
    }
  }
};

const STORAGE_KEY = 'sdg_database_v1';
const CURRENT_USER_KEY = 'sdg_session_user_v1';

class LocalDatabase {
  constructor() {
    this.listeners = new Set();
    this.data = this.load();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.data = this.load();
          this.notify();
        }
      });
    }
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignora erro
    }
    this.save(SEED_DATA);
    return JSON.parse(JSON.stringify(SEED_DATA));
  }

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage pode estar cheio se colocar imagem grande
    }
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('Erro em listener do LocalDB:', err);
      }
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getCollection(collName) {
    return this.data[collName] || {};
  }

  getDoc(collName, docId) {
    return this.data[collName]?.[docId] || null;
  }

  setDoc(collName, docId, docData, options = {}) {
    if (!this.data[collName]) this.data[collName] = {};
    const existing = this.data[collName][docId] || {};
    this.data[collName][docId] = options.merge
      ? { ...existing, ...docData, id: docId }
      : { ...docData, id: docId };
    this.save(this.data);
    this.notify();
  }

  addDoc(collName, docData) {
    const id = `${collName}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    this.setDoc(collName, id, { ...docData, id });
    return { id };
  }

  updateDoc(collName, docId, updates) {
    if (!this.data[collName]?.[docId]) return;
    this.data[collName][docId] = {
      ...this.data[collName][docId],
      ...updates,
      id: docId
    };
    this.save(this.data);
    this.notify();
  }

  deleteDoc(collName, docId) {
    if (this.data[collName]?.[docId]) {
      delete this.data[collName][docId];
      this.save(this.data);
      this.notify();
    }
  }
}

export const localDb = new LocalDatabase();

// ── Funções de Firestore Compatíveis ────────────────────────────────────────

class LocalDocSnapshot {
  constructor(id, data) {
    this.id = id;
    this._data = data;
  }
  exists() {
    return Boolean(this._data);
  }
  data() {
    if (!this._data) return undefined;
    const res = { ...this._data };
    // converte campos de data se existirem
    if (res.createdAt) {
      res.createdAt = {
        toDate: () => new Date(res.createdAt),
        toMillis: () => new Date(res.createdAt).getTime(),
      };
    }
    if (res.updatedAt) {
      res.updatedAt = {
        toDate: () => new Date(res.updatedAt),
        toMillis: () => new Date(res.updatedAt).getTime(),
      };
    }
    return res;
  }
}

class LocalQuerySnapshot {
  constructor(docs) {
    this.docs = docs;
    this.empty = docs.length === 0;
    this.size = docs.length;
  }
  forEach(callback) {
    this.docs.forEach(callback);
  }
}

export function collection(dbRef, collName) {
  if (isFirebaseConfigured && fbDbInstance) {
    return fbCollection(fbDbInstance, collName);
  }
  return { __type: 'collection', collName };
}

export function doc(dbRef, collName, docId) {
  if (isFirebaseConfigured && fbDbInstance) {
    return fbDoc(fbDbInstance, collName, docId);
  }
  return { __type: 'doc', collName, docId };
}

export function query(colOrQuery, ...filters) {
  if (isFirebaseConfigured && fbDbInstance) {
    return fbQuery(colOrQuery, ...filters);
  }
  return { __type: 'query', source: colOrQuery, filters };
}

export function where(field, op, value) {
  if (isFirebaseConfigured && fbDbInstance) {
    return fbWhere(field, op, value);
  }
  return { type: 'where', field, op, value };
}

export function orderBy(field, direction = 'asc') {
  if (isFirebaseConfigured && fbDbInstance) {
    return fbOrderBy(field, direction);
  }
  return { type: 'orderBy', field, direction };
}

export function limit(count) {
  if (isFirebaseConfigured && fbDbInstance) {
    return fbLimit(count);
  }
  return { type: 'limit', count };
}

export function serverTimestamp() {
  if (isFirebaseConfigured && fbDbInstance) {
    return fbServerTimestamp();
  }
  return new Date().toISOString();
}

function executeLocalQuery(q) {
  const collName = q.__type === 'collection' ? q.collName : q.source.collName;
  const rawItems = Object.values(localDb.getCollection(collName));
  let items = [...rawItems];

  const filters = q.filters || [];
  for (const f of filters) {
    if (f.type === 'where') {
      items = items.filter(item => {
        if (f.op === '==') return item[f.field] === f.value;
        if (f.op === '!=') return item[f.field] !== f.value;
        if (f.op === '>') return item[f.field] > f.value;
        if (f.op === '<') return item[f.field] < f.value;
        return true;
      });
    }
  }

  for (const f of filters) {
    if (f.type === 'orderBy') {
      items.sort((a, b) => {
        const valA = a[f.field] || '';
        const valB = b[f.field] || '';
        if (valA < valB) return f.direction === 'desc' ? 1 : -1;
        if (valA > valB) return f.direction === 'desc' ? -1 : 1;
        return 0;
      });
    }
  }

  for (const f of filters) {
    if (f.type === 'limit') {
      items = items.slice(0, f.count);
    }
  }

  const docSnaps = items.map(item => new LocalDocSnapshot(item.id, item));
  return new LocalQuerySnapshot(docSnaps);
}

export async function getDoc(docRef) {
  if (isFirebaseConfigured && fbDbInstance) {
    return fbGetDoc(docRef);
  }
  const raw = localDb.getDoc(docRef.collName, docRef.docId);
  return new LocalDocSnapshot(docRef.docId, raw);
}

export async function getDocs(queryRef) {
  if (isFirebaseConfigured && fbDbInstance) {
    return fbGetDocs(queryRef);
  }
  return executeLocalQuery(queryRef);
}

export async function setDoc(docRef, data, options = {}) {
  if (isFirebaseConfigured && fbDbInstance) {
    return fbSetDoc(docRef, data, options);
  }
  localDb.setDoc(docRef.collName, docRef.docId, data, options);
}

export async function addDoc(colRef, data) {
  if (isFirebaseConfigured && fbDbInstance) {
    return fbAddDoc(colRef, data);
  }
  return localDb.addDoc(colRef.collName, data);
}

export async function updateDoc(docRef, data) {
  if (isFirebaseConfigured && fbDbInstance) {
    return fbUpdateDoc(docRef, data);
  }
  localDb.updateDoc(docRef.collName, docRef.docId, data);
}

export async function deleteDoc(docRef) {
  if (isFirebaseConfigured && fbDbInstance) {
    return fbDeleteDoc(docRef);
  }
  localDb.deleteDoc(docRef.collName, docRef.docId);
}

export function onSnapshot(target, callback) {
  if (isFirebaseConfigured && fbDbInstance) {
    return fbOnSnapshot(target, callback);
  }

  const run = () => {
    if (target.__type === 'doc') {
      const raw = localDb.getDoc(target.collName, target.docId);
      callback(new LocalDocSnapshot(target.docId, raw));
    } else {
      const snap = executeLocalQuery(target);
      callback(snap);
    }
  };

  run();
  return localDb.subscribe(run);
}

// ── Storage (Imagens) ──────────────────────────────────────────────────────

export function ref(storageRef, path) {
  if (isFirebaseConfigured && fbStorageInstance) {
    return fbRef(fbStorageInstance, path);
  }
  return { __type: 'storage_ref', path };
}

export async function uploadBytes(storageRef, file) {
  if (isFirebaseConfigured && fbStorageInstance) {
    return fbUploadBytes(storageRef, file);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        ref: storageRef,
        dataUrl: reader.result
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function getDownloadURL(uploadResultOrRef) {
  if (isFirebaseConfigured && fbStorageInstance) {
    return fbGetDownloadURL(uploadResultOrRef);
  }
  if (uploadResultOrRef?.dataUrl) {
    return uploadResultOrRef.dataUrl;
  }
  return uploadResultOrRef;
}

// ── Auth Service ────────────────────────────────────────────────────────────

class LocalAuth {
  constructor() {
    this.authListeners = new Set();
    this.currentUser = this.loadUser();
  }

  loadUser() {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  saveUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    this.notifyAuth();
  }

  notifyAuth() {
    for (const cb of this.authListeners) {
      try {
        cb(this.currentUser);
      } catch (err) {
        console.error('Erro em authListener:', err);
      }
    }
  }

  onAuthStateChanged(callback) {
    this.authListeners.add(callback);
    callback(this.currentUser);
    return () => this.authListeners.delete(callback);
  }

  async signInWithEmailAndPassword(email, password) {
    const users = Object.values(localDb.getCollection('usuarios'));
    // Busca por email gerado ou por nome direto
    const found = users.find(
      u => u.email === email || (u.nome && `${u.nome.trim().toLowerCase().replace(/\s+/g, '_')}@sdg.local` === email)
    );

    if (!found) {
      const err = new Error('Usuário não encontrado');
      err.code = 'auth/user-not-found';
      throw err;
    }

    if (found.senha !== password) {
      const err = new Error('Senha incorreta');
      err.code = 'auth/wrong-password';
      throw err;
    }

    const sessionUser = {
      uid: found.id,
      email: found.email || email,
      displayName: found.nome,
    };
    this.saveUser(sessionUser);
    return { user: sessionUser };
  }

  async createUserWithEmailAndPassword(email, password, nome = '') {
    const users = Object.values(localDb.getCollection('usuarios'));
    const cleanNome = nome.trim() || email.split('@')[0];
    const existing = users.find(
      u => u.nome?.toLowerCase() === cleanNome.toLowerCase()
    );

    if (existing) {
      const err = new Error('Esse nome de guerra já está em uso');
      err.code = 'auth/email-already-in-use';
      throw err;
    }

    const uid = `user_${Date.now()}`;
    const newUser = {
      id: uid,
      nome: cleanNome,
      email,
      senha: password,
      role: 'aluno',
      createdAt: new Date().toISOString()
    };

    localDb.setDoc('usuarios', uid, newUser);

    const sessionUser = {
      uid,
      email,
      displayName: cleanNome,
    };
    this.saveUser(sessionUser);
    return { user: sessionUser };
  }

  async signOut() {
    this.saveUser(null);
  }
}

export const localAuth = new LocalAuth();

// Exports de compatibilidade
export const auth = isFirebaseConfigured && fbAuthInstance ? fbAuthInstance : localAuth;
export const db = isFirebaseConfigured && fbDbInstance ? fbDbInstance : localDb;
export const storage = isFirebaseConfigured && fbStorageInstance ? fbStorageInstance : null;

export const createUserWithEmailAndPassword = async (authInst, email, senha, nome) => {
  if (isFirebaseConfigured && fbAuthInstance) {
    return fbCreateUser(fbAuthInstance, email, senha);
  }
  return localAuth.createUserWithEmailAndPassword(email, senha, nome);
};

export const signInWithEmailAndPassword = async (authInst, email, senha) => {
  if (isFirebaseConfigured && fbAuthInstance) {
    return fbSignIn(fbAuthInstance, email, senha);
  }
  return localAuth.signInWithEmailAndPassword(email, senha);
};

export const signOut = async (authInst) => {
  if (isFirebaseConfigured && fbAuthInstance) {
    return fbSignOut(fbAuthInstance);
  }
  return localAuth.signOut();
};

export const onAuthStateChanged = (authInst, callback) => {
  if (isFirebaseConfigured && fbAuthInstance) {
    return fbOnAuthStateChanged(fbAuthInstance, callback);
  }
  return localAuth.onAuthStateChanged(callback);
};
