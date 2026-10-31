// src/services/db.js
// Camada de dados e autenticação da Sala de Guerra
// Inicializa limpo ("cru") com apenas o admin CowBoy (senha: cowboy123!)
// e suporte a cadastro/login direto de alunos e troca de senha.

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword as fbCreateUser,
  signInWithEmailAndPassword as fbSignIn,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updatePassword as fbUpdatePassword
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
    console.warn('Firebase não configurado, operando com LocalStore:', err);
  }
}

// ── ESTADO INICIAL CRU ──────────────────────────────────────────────────────
// Somente o admin CowBoy pré-configurado com a senha oficial
const SEED_DATA = {
  usuarios: {
    user_cowboy: {
      id: 'user_cowboy',
      nome: 'CowBoy',
      senha: 'cowboy123!',
      role: 'admin',
      createdAt: '2026-10-31T20:00:00.000Z'
    }
  },
  modelos: {},
  pedidos_ajuda: {},
  notificacoes: {},
  curiosidades: {
    curio_1: {
      id: 'curio_1',
      titulo: 'Estratégia de Posicionamento da Modelo',
      corpo: 'Defina nicho, subnicho e rotina autêntica antes de iniciar as postagens. Humanização e consistência geram conexão rápida.',
      createdAt: '2026-10-31T20:00:00.000Z'
    }
  },
  perfis_inspiracao: {}
};

const STORAGE_KEY = 'sdg_database_v3';
const CURRENT_USER_KEY = 'sdg_session_user_v3';

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
        const parsed = JSON.parse(stored);
        // Garante que o CowBoy sempre existe e tem papel de admin
        if (!parsed.usuarios) parsed.usuarios = {};
        const hasCowboy = Object.values(parsed.usuarios).some(
          u => u.nome?.toLowerCase() === 'cowboy'
        );
        if (!hasCowboy) {
          parsed.usuarios.user_cowboy = SEED_DATA.usuarios.user_cowboy;
        }
        return parsed;
      }
    } catch {
      // Ignora erro e reseta
    }
    this.save(SEED_DATA);
    return JSON.parse(JSON.stringify(SEED_DATA));
  }

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Erro ao salvar no localStorage:', err);
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

// ── Classes de Compatibilidade Firestore ───────────────────────────────────

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
      const res = {
        ref: storageRef,
        dataUrl: reader.result
      };
      if (storageRef && typeof storageRef === 'object') {
        storageRef.dataUrl = reader.result;
      }
      resolve(res);
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

  async signInWithEmailAndPassword(email, password, inputNome = '') {
    const users = Object.values(localDb.getCollection('usuarios'));
    const target = (inputNome || email.split('@')[0]).trim().toLowerCase();

    // Procura por nome (case-insensitive) ou email
    const found = users.find(u => {
      const nomeMatch = u.nome?.toLowerCase() === target;
      const emailMatch = u.email?.toLowerCase() === email.toLowerCase();
      return nomeMatch || emailMatch;
    });

    if (!found) {
      const err = new Error('Usuário não encontrado. Cadastre-se na aba Cadastrar.');
      err.code = 'auth/user-not-found';
      throw err;
    }

    if (found.senha !== password) {
      const err = new Error('Senha incorreta.');
      err.code = 'auth/wrong-password';
      throw err;
    }

    const sessionUser = {
      uid: found.id,
      email: found.email || `${found.nome.toLowerCase()}@sdg.local`,
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
      const err = new Error('Esse nome de guerra já está em uso.');
      err.code = 'auth/email-already-in-use';
      throw err;
    }

    const isCowboy = cleanNome.toLowerCase() === 'cowboy';
    const uid = isCowboy ? 'user_cowboy' : `user_${Date.now()}`;
    const newUser = {
      id: uid,
      nome: cleanNome,
      email,
      senha: password,
      role: isCowboy ? 'admin' : 'aluno',
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

  async changePassword(userId, newPassword) {
    const user = localDb.getDoc('usuarios', userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    localDb.updateDoc('usuarios', userId, {
      senha: newPassword,
      updatedAt: new Date().toISOString()
    });
    return true;
  }

  async signOut() {
    this.saveUser(null);
  }
}

export const localAuth = new LocalAuth();

// Exports unificados
export const auth = isFirebaseConfigured && fbAuthInstance ? fbAuthInstance : localAuth;
export const db = isFirebaseConfigured && fbDbInstance ? fbDbInstance : localDb;
export const storage = isFirebaseConfigured && fbStorageInstance ? fbStorageInstance : null;

export const createUserWithEmailAndPassword = async (authInst, email, senha, nome) => {
  if (isFirebaseConfigured && fbAuthInstance) {
    return fbCreateUser(fbAuthInstance, email, senha);
  }
  return localAuth.createUserWithEmailAndPassword(email, senha, nome);
};

export const signInWithEmailAndPassword = async (authInst, email, senha, nome) => {
  if (isFirebaseConfigured && fbAuthInstance) {
    return fbSignIn(fbAuthInstance, email, senha);
  }
  return localAuth.signInWithEmailAndPassword(email, senha, nome);
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

export const updateUserPassword = async (userId, newPassword) => {
  if (isFirebaseConfigured && fbAuthInstance && fbAuthInstance.currentUser) {
    try {
      await fbUpdatePassword(fbAuthInstance.currentUser, newPassword);
    } catch {
      // Se precisar reautenticar no Firebase, tenta atualizar doc
    }
    await setDoc(doc(db, 'usuarios', userId), { updatedAt: serverTimestamp() }, { merge: true });
    return true;
  }
  return localAuth.changePassword(userId, newPassword);
};
