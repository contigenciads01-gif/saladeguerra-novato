// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  isFirebaseConfigured
} from '../services/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (activeUser) => {
      if (activeUser) {
        setUser(activeUser);
        try {
          const snap = await getDoc(doc(db, 'usuarios', activeUser.uid));
          if (snap.exists()) {
            setProfile(snap.data());
          } else {
            // fallback se documento ainda não existir
            setProfile({
              nome: activeUser.displayName || 'Aluno',
              role: activeUser.displayName === 'admin' ? 'admin' : 'aluno'
            });
          }
        } catch (err) {
          console.error('Erro ao buscar perfil:', err);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const fakeEmail = (nome) => `${nome.trim().toLowerCase().replace(/\s+/g, '_')}@sdg.local`;

  async function cadastrar(nome, senha) {
    const cleanNome = nome.trim();
    const email = fakeEmail(cleanNome);
    const cred = await createUserWithEmailAndPassword(auth, email, senha, cleanNome);
    const uid = cred.user.uid;
    const userDoc = {
      nome: cleanNome,
      email,
      role: cleanNome.toLowerCase() === 'admin' ? 'admin' : 'aluno',
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'usuarios', uid), userDoc, { merge: true });
    setProfile(userDoc);
    return cred.user;
  }

  async function login(nome, senha) {
    const cleanNome = nome.trim();
    const email = fakeEmail(cleanNome);
    const res = await signInWithEmailAndPassword(auth, email, senha);
    // Carrega perfil
    const snap = await getDoc(doc(db, 'usuarios', res.user.uid));
    if (snap.exists()) {
      setProfile(snap.data());
    }
    return res;
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isFirebaseConfigured, cadastrar, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
