// src/pages/FeedPage.jsx
import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, query, orderBy, doc, getDoc,
  where, limit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';
import MyModelCard from '../components/MyModelCard';
import ModelCard from '../components/ModelCard';
import EmptyModelCard from '../components/EmptyModelCard';
import CuriositiesTab from '../components/CuriositiesTab';
import InspirationTab from '../components/InspirationTab';
import ProfileTab from '../components/ProfileTab';
import EditModelModal from '../components/EditModelModal';
import CowboyLogo from '../components/CowboyLogo';
import { Shield } from 'lucide-react';

export default function FeedPage() {
  const { user, profile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [minhaModelo, setMinhaModelo] = useState(null);
  const [minhaModeloLoaded, setMinhaModeloLoaded] = useState(false);
  const [meuPedido, setMeuPedido] = useState(null);
  const [outrasModelos, setOutrasModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  // Minha modelo (real-time)
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'modelos', user.uid), snap => {
      setMinhaModelo(snap.exists() ? snap.data() : null);
      setMinhaModeloLoaded(true);
    });
    return unsub;
  }, [user]);

  // Meu pedido de ajuda pendente (real-time)
  useEffect(() => {
    if (!user) return;
    const pedidoQuery = query(
      collection(db, 'pedidos_ajuda'),
      where('userId', '==', user.uid),
      where('status', '==', 'Pendente'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const unsub = onSnapshot(pedidoQuery, snap => {
      setMeuPedido(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
    });
    return unsub;
  }, [user]);

  // Todas as modelos dos outros alunos
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'modelos'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, async snap => {
      const modelosPromises = snap.docs
        .filter(d => d.id !== user.uid)
        .map(async d => {
          const userSnap = await getDoc(doc(db, 'usuarios', d.id));
          return {
            id: d.id,
            modelo: d.data(),
            nomeAluno: userSnap.exists() ? userSnap.data()?.nome : 'Aluno',
          };
        });
      const modelos = await Promise.all(modelosPromises);
      setOutrasModelos(modelos);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return (
    <div className="min-h-screen bg-bg relative">
      <div className="fog-bg" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur border-b border-cyan-neon/20 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CowboyLogo size={32} />
            <div>
              <h1 className="display-title text-lg leading-none">SALA DE GUERRA</h1>
              <p className="text-[10px] text-cyan-neon/50 tracking-widest">ETAPA 1</p>
            </div>
          </div>
          {isAdmin && (
            <a href="/admin"
               className="flex items-center gap-1.5 text-xs border border-cyan-neon/40 text-cyan-neon
                          px-3 py-1.5 rounded-xl hover:shadow-neon transition-all">
              <Shield size={12} /> Painel Admin
            </a>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24 relative z-10">
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Minha modelo */}
            <div>
              <p className="display-title text-base text-silver/60 mb-3">🎯 SUA MODELO</p>
              {!minhaModeloLoaded ? (
                <div className="card-neon p-8 text-center">
                  <p className="text-silver/40 animate-pulse">Carregando...</p>
                </div>
              ) : minhaModelo ? (
                <MyModelCard
                  modelo={minhaModelo}
                  pedido={meuPedido}
                  nomeAluno={profile?.nome}
                  onModeloUpdated={setMinhaModelo}
                  onPedidoUpdated={setMeuPedido}
                />
              ) : (
                <EmptyModelCard onClick={() => setCreateOpen(true)} />
              )}
            </div>

            {/* Modelos da turma */}
            {(loading || outrasModelos.length > 0) && (
              <div>
                <p className="display-title text-base text-silver/60 mb-3">👥 MODELOS DA TURMA</p>
                {loading ? (
                  <p className="text-silver/40 text-center py-8 animate-pulse">Carregando...</p>
                ) : (
                  <div className="space-y-6">
                    {outrasModelos.map(({ id, modelo, nomeAluno }) => (
                      <ModelCard key={id} modelo={modelo} nomeAluno={nomeAluno} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {!loading && outrasModelos.length === 0 && minhaModelo && (
              <p className="text-silver/30 text-center py-8 text-sm">
                Você é o(a) primeiro(a)! Aguarde os outros alunos.
              </p>
            )}
          </div>
        )}

        {activeTab === 'curiosidades' && <CuriositiesTab />}
        {activeTab === 'inspiracoes' && <InspirationTab />}
        {activeTab === 'perfil' && <ProfileTab />}
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />

      {createOpen && (
        <EditModelModal
          modelo={null}
          onClose={() => setCreateOpen(false)}
          onSaved={setMinhaModelo}
        />
      )}
    </div>
  );
}
