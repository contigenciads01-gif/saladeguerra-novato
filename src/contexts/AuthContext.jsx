// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase Auth user
  const [profile, setProfile] = useState(null); // Firestore user doc
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const snap = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
        if (snap.exists()) {
          setProfile(snap.data());
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Firebase Auth uses email; we store nome + fake email (nome@sdg.local)
  const fakeEmail = (nome) => `${nome.trim().toLowerCase().replace(/\s+/g, '_')}@sdg.local`;

  async function cadastrar(nome, senha) {
    const email = fakeEmail(nome);
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    await setDoc(doc(db, 'usuarios', cred.user.uid), {
      nome,
      email,
      role: 'aluno',
      createdAt: serverTimestamp(),
    });
    setProfile({ nome, email, role: 'aluno' });
    return cred.user;
  }

  async function login(nome, senha) {
    const email = fakeEmail(nome);
    return signInWithEmailAndPassword(auth, email, senha);
  }

  async function logout() {
    await signOut(auth);
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, cadastrar, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
