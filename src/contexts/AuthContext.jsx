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
  isFirebaseConfigured,
  updateUserPassword
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
            const isCowboy = activeUser.displayName?.toLowerCase() === 'cowboy';
            setProfile({
              id: activeUser.uid,
              nome: activeUser.displayName || 'Aluno',
              role: isCowboy ? 'admin' : 'aluno'
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
    const isCowboy = cleanNome.toLowerCase() === 'cowboy';

    const userDoc = {
      id: uid,
      nome: cleanNome,
      email,
      role: isCowboy ? 'admin' : 'aluno',
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'usuarios', uid), userDoc, { merge: true });
    setProfile(userDoc);
    return cred.user;
  }

  async function login(nome, senha) {
    const cleanNome = nome.trim();
    const email = fakeEmail(cleanNome);
    const res = await signInWithEmailAndPassword(auth, email, senha, cleanNome);
    const snap = await getDoc(doc(db, 'usuarios', res.user.uid));
    if (snap.exists()) {
      setProfile(snap.data());
    } else {
      const isCowboy = cleanNome.toLowerCase() === 'cowboy';
      setProfile({
        id: res.user.uid,
        nome: cleanNome,
        role: isCowboy ? 'admin' : 'aluno'
      });
    }
    return res;
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  }

  async function alterarSenha(novaSenha) {
    if (!user?.uid) throw new Error('Nenhum usuário conectado');
    await updateUserPassword(user.uid, novaSenha);
    return true;
  }

  const isAdmin = profile?.role === 'admin' || profile?.nome?.toLowerCase() === 'cowboy';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      isFirebaseConfigured,
      cadastrar,
      login,
      logout,
      alterarSenha
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
