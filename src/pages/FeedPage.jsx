// src/pages/FeedPage.jsx
import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  where,
  limit,
  db
} from '../services/db';
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
import { Shield, Sparkles, Users } from 'lucide-react';

export default function FeedPage() {
  const { user, profile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [minhaModelo, setMinhaModelo] = useState(null);
  const [minhaModeloLoaded, setMinhaModeloLoaded] = useState(false);
  const [meuPedido, setMeuPedido] = useState(null);
  const [outrasModelos, setOutrasModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  // Minha modelo (tempo real)
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'modelos', user.uid), snap => {
      setMinhaModelo(snap.exists() ? snap.data() : null);
      setMinhaModeloLoaded(true);
    });
    return unsub;
  }, [user]);

  // Meu pedido de ajuda pendente (tempo real)
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

  // Modelos dos outros alunos
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
    <div className="min-h-screen bg-bg relative selection:bg-cyan-neon selection:text-bg">
      <div className="fog-bg" />

      {/* Header Superior Fixo */}
      <header className="sticky top-0 z-30 bg-[#070B12]/95 backdrop-blur-md border-b border-cyan-neon/25 px-4 py-3 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CowboyLogo size={34} className="drop-shadow-[0_0_8px_#00E5FF]" />
            <div>
              <h1 className="display-title text-xl leading-none text-transparent bg-clip-text bg-gradient-to-r from-ice to-cyan-neon">
                SALA DE GUERRA
              </h1>
              <p className="text-[10px] text-cyan-neon/70 font-bold tracking-widest uppercase mt-0.5">
                ETAPA 1
              </p>
            </div>
          </div>

          {isAdmin && (
            <a
              href="/admin"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border border-cyan-neon/40 text-cyan-neon hover:bg-cyan-neon/10 hover:shadow-neon transition-all"
            >
              <Shield size={14} /> Painel CowBoy
            </a>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-lg mx-auto px-4 pt-5 pb-28 relative z-10">
        {activeTab === 'feed' && (
          <div className="space-y-7 animate-fade-in">
            {/* Minha Modelo */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="display-title text-base flex items-center gap-1.5 text-cyan-neon">
                  <Sparkles size={16} /> SUA MODELO
                </p>
                <span className="text-[10px] uppercase font-bold tracking-wider text-silver/40">
                  SEU DASHBOARD
                </span>
              </div>

              {!minhaModeloLoaded ? (
                <div className="card-neon p-12 text-center rounded-2xl">
                  <div className="w-8 h-8 border-2 border-cyan-neon border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-silver/50 text-xs font-semibold animate-pulse">
                    Carregando sua modelo...
                  </p>
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

            {/* Modelos dos Colegas de Turma */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="display-title text-base flex items-center gap-1.5 text-silver/80">
                  <Users size={16} className="text-cyan-neon/70" /> MODELOS DA TURMA
                </p>
                <span className="text-[10px] uppercase font-bold tracking-wider text-silver/40">
                  {outrasModelos.length} ATIVA{outrasModelos.length !== 1 ? 'S' : ''}
                </span>
              </div>

              {loading ? (
                <div className="card-neon p-8 text-center rounded-2xl">
                  <p className="text-silver/40 text-xs animate-pulse">Carregando modelos da turma...</p>
                </div>
              ) : outrasModelos.length > 0 ? (
                <div className="space-y-6">
                  {outrasModelos.map(({ id, modelo, nomeAluno }) => (
                    <ModelCard key={id} modelo={modelo} nomeAluno={nomeAluno} />
                  ))}
                </div>
              ) : (
                <div className="card-neon p-8 text-center rounded-2xl border-dashed border-cyan-neon/20 bg-white/[0.01]">
                  <p className="text-silver/40 text-xs">
                    Nenhum outro aluno publicou uma modelo ainda.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'curiosidades' && <CuriositiesTab />}
        {activeTab === 'inspiracoes' && <InspirationTab />}
        {activeTab === 'perfil' && <ProfileTab />}
      </main>

      {/* Navegação Inferior */}
      <BottomNav active={activeTab} onChange={setActiveTab} />

      {/* Modal Criar Modelo */}
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
