// src/pages/AdminPage.jsx
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, getDoc, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CowboyLogo from '../components/CowboyLogo';
import CuriositiesTab from '../components/CuriositiesTab';
import InspirationTab from '../components/InspirationTab';
import {
  Bell, Users, Image, Hand, CheckCircle, Clock, AlertCircle,
  Home, Lightbulb, Star, LogOut, ChevronRight, X
} from 'lucide-react';

const STATUS_COLOR = {
  Pendente: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10',
  'Em andamento': 'text-blue-400 border-blue-400/40 bg-blue-400/10',
  Resolvido: 'text-green-400 border-green-400/40 bg-green-400/10',
  Cancelado: 'text-silver/40 border-silver/20 bg-white/5',
};

function MetricCard({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`card-neon p-4 flex items-center gap-3 ${highlight ? 'border-cyan-neon shadow-neon-sm' : ''}`}>
      <div className="w-10 h-10 rounded-xl bg-cyan-neon/10 flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-cyan-neon" />
      </div>
      <div>
        <p className="text-2xl font-bold text-ice leading-none">{value}</p>
        <p className="text-xs text-silver/60 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('visao');
  const [alunos, setAlunos] = useState([]);
  const [modelos, setModelos] = useState({});
  const [pedidos, setPedidos] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);

  // Alunos
  useEffect(() => {
    const q = query(collection(db, 'usuarios'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setAlunos(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role !== 'admin'));
    });
  }, []);

  // Modelos
  useEffect(() => {
    return onSnapshot(collection(db, 'modelos'), snap => {
      const map = {};
      snap.docs.forEach(d => { map[d.id] = d.data(); });
      setModelos(map);
    });
  }, []);

  // Pedidos
  useEffect(() => {
    const q = query(collection(db, 'pedidos_ajuda'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setPedidos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // Notificações
  useEffect(() => {
    const q = query(
      collection(db, 'notificacoes'),
      where('lida', '==', false),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap => {
      setNotificacoes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  async function markNotifRead(id) {
    await updateDoc(doc(db, 'notificacoes', id), { lida: true });
  }

  async function markAllRead() {
    for (const n of notificacoes) {
      await updateDoc(doc(db, 'notificacoes', n.id), { lida: true });
    }
    setNotifOpen(false);
  }

  async function updatePedidoStatus(id, status) {
    await updateDoc(doc(db, 'pedidos_ajuda', id), { status, updatedAt: serverTimestamp() });
    toast.success(`Pedido marcado como "${status}"`);
  }

  async function handleLogout() {
    await logout();
    navigate('/auth');
  }

  const totalAlunos = alunos.length;
  const totalModelos = Object.keys(modelos).length;
  const pendentes = pedidos.filter(p => p.status === 'Pendente').length;
  const notifsNaoLidas = notificacoes.length;

  function formatDate(ts) {
    if (!ts) return '—';
    const d = ts.toDate?.() || new Date(ts);
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  const ADMIN_TABS = [
    { id: 'visao', label: 'Visão Geral', icon: Home },
    { id: 'pedidos', label: 'Pedidos', icon: Hand },
    { id: 'curiosidades', label: 'Curiosidades', icon: Lightbulb },
    { id: 'inspiracoes', label: 'Inspirações', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-bg relative">
      <div className="fog-bg" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur border-b border-cyan-neon/20 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CowboyLogo size={32} />
            <div>
              <h1 className="display-title text-lg leading-none">PAINEL DO COWBOY</h1>
              <p className="text-[10px] text-cyan-neon/50 tracking-widest">ADMIN</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Sino de notificações */}
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl border border-cyan-neon/30 hover:border-cyan-neon
                         text-silver hover:text-cyan-neon transition-all"
            >
              <Bell size={18} />
              {notifsNaoLidas > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-neon text-bg text-[10px]
                                 font-bold rounded-full flex items-center justify-center shadow-neon">
                  {notifsNaoLidas > 9 ? '9+' : notifsNaoLidas}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Painel de notificações */}
      {notifOpen && (
        <div className="fixed top-16 right-4 z-50 w-80 card-mine rounded-2xl p-4 shadow-neon-lg animate-slide-up max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-cyan-neon">Notificações</h3>
            <div className="flex gap-2">
              {notifsNaoLidas > 0 && (
                <button onClick={markAllRead} className="text-xs text-silver/60 hover:text-cyan-neon">Ler todas</button>
              )}
              <button onClick={() => setNotifOpen(false)} className="text-silver/60 hover:text-ice">
                <X size={16} />
              </button>
            </div>
          </div>
          {notificacoes.length === 0 ? (
            <p className="text-silver/40 text-sm text-center py-4">Nenhuma notificação</p>
          ) : (
            <div className="space-y-2">
              {notificacoes.map(n => (
                <div key={n.id} className="bg-white/5 rounded-xl p-3 flex items-start gap-2">
                  <Hand size={14} className="text-cyan-neon mt-0.5 flex-shrink-0" />
                  <div className="flex-1 text-sm">
                    <p className="text-ice"><strong>{n.nomeAluno}</strong> precisa de ajuda</p>
                    <p className="text-silver/60 text-xs mt-0.5 line-clamp-2">"{n.topico}"</p>
                  </div>
                  <button onClick={() => markNotifRead(n.id)} className="text-silver/40 hover:text-cyan-neon flex-shrink-0">
                    <CheckCircle size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav tabs admin */}
      <div className="sticky top-[57px] z-20 bg-bg/95 backdrop-blur border-b border-cyan-neon/10">
        <div className="max-w-2xl mx-auto px-4 flex gap-1 overflow-x-auto py-2 scrollbar-hide">
          {ADMIN_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'bg-cyan-neon text-bg'
                  : 'text-silver/70 hover:text-ice border border-transparent hover:border-cyan-neon/20'
              }`}
            >
              <Icon size={14} /> {label}
              {id === 'pedidos' && pendentes > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === id ? 'bg-bg text-cyan-neon' : 'bg-yellow-400/20 text-yellow-400'
                }`}>
                  {pendentes}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-4 pb-8 relative z-10">

        {/* ── VISÃO GERAL ── */}
        {activeTab === 'visao' && (
          <div className="space-y-6">
            {/* Métricas */}
            <div className="grid grid-cols-3 gap-3">
              <MetricCard icon={Users} label="Alunos" value={totalAlunos} />
              <MetricCard icon={Image} label="Modelos" value={totalModelos} />
              <MetricCard icon={Hand} label="Pendentes" value={pendentes} highlight={pendentes > 0} />
            </div>

            {/* Lista de alunos */}
            <div>
              <h2 className="display-title text-xl mb-3">Alunos</h2>
              {alunos.length === 0 && <p className="text-silver/40 text-sm">Nenhum aluno cadastrado.</p>}
              <div className="space-y-3">
                {alunos.map(aluno => {
                  const modelo = modelos[aluno.id];
                  return (
                    <div
                      key={aluno.id}
                      className="card-neon p-4 flex items-center gap-4 cursor-pointer hover:border-cyan-neon/60 transition-all"
                      onClick={() => setSelectedAluno(aluno.id === selectedAluno ? null : aluno.id)}
                    >
                      {modelo?.fotoURL ? (
                        <img src={modelo.fotoURL} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                          <Users size={20} className="text-silver/30" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ice truncate">{aluno.nome}</p>
                        {modelo ? (
                          <p className="text-sm text-silver/60 truncate">
                            Modelo: {modelo.nome} · {modelo.trabalho}
                          </p>
                        ) : (
                          <p className="text-sm text-silver/40">Sem modelo ainda</p>
                        )}
                      </div>
                      <ChevronRight size={16} className={`text-silver/40 transition-transform ${selectedAluno === aluno.id ? 'rotate-90' : ''}`} />
                    </div>
                  );
                })}
              </div>

              {/* Detalhe aluno */}
              {selectedAluno && modelos[selectedAluno] && (() => {
                const modelo = modelos[selectedAluno];
                const aluno = alunos.find(a => a.id === selectedAluno);
                return (
                  <div className="mt-4 card-mine p-5 animate-slide-up">
                    <div className="flex items-start gap-4">
                      {modelo.fotoURL && (
                        <img src={modelo.fotoURL} alt="" className="w-24 h-32 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 space-y-2">
                        <h3 className="display-title text-xl">{modelo.nome}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-silver">
                          <p><span className="text-silver/50">Idade:</span> {modelo.idade}</p>
                          <p><span className="text-silver/50">Trabalho:</span> {modelo.trabalho}</p>
                          <p><span className="text-silver/50">Hobby:</span> {modelo.hobby}</p>
                          <p><span className="text-silver/50">Subnicho:</span> {modelo.subnicho}</p>
                        </div>
                        {modelo.descricao && <p className="text-silver/70 text-sm">{modelo.descricao}</p>}
                        <p className="text-xs text-silver/40">Aluno: {aluno?.nome}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── PEDIDOS ── */}
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            <h2 className="display-title text-2xl flex items-center gap-2">
              <Hand size={20}/> Pedidos de Ajuda
            </h2>

            {pedidos.length === 0 && (
              <p className="text-silver/40 text-center py-12">Nenhum pedido ainda.</p>
            )}

            {/* Pendentes primeiro */}
            {['Pendente', 'Em andamento', 'Resolvido', 'Cancelado'].map(status => {
              const grupo = pedidos.filter(p => p.status === status);
              if (grupo.length === 0) return null;
              return (
                <div key={status}>
                  <h3 className="text-sm font-semibold text-silver/60 mb-2 uppercase tracking-wider">{status}</h3>
                  <div className="space-y-3">
                    {grupo.map(p => (
                      <div key={p.id} className={`card-neon p-4 space-y-3 ${status === 'Pendente' ? 'border-yellow-400/40' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-ice">{p.nomeAluno}</p>
                            {p.nomeModelo && <p className="text-xs text-silver/50">Modelo: {p.nomeModelo}</p>}
                            <p className="text-xs text-silver/40 mt-0.5">{formatDate(p.createdAt)}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${STATUS_COLOR[p.status]}`}>
                            {p.status}
                          </span>
                        </div>
                        <p className="text-silver/80 text-sm bg-white/5 rounded-xl p-3">{p.topico}</p>
                        {(p.status === 'Pendente' || p.status === 'Em andamento') && (
                          <div className="flex gap-2">
                            {p.status === 'Pendente' && (
                              <button
                                onClick={() => updatePedidoStatus(p.id, 'Em andamento')}
                                className="btn-neon text-xs flex items-center gap-1"
                              >
                                <Clock size={12}/> Em andamento
                              </button>
                            )}
                            <button
                              onClick={() => updatePedidoStatus(p.id, 'Resolvido')}
                              className="btn-neon-filled text-xs flex items-center gap-1"
                            >
                              <CheckCircle size={12}/> Resolver
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'curiosidades' && <CuriositiesTab />}
        {activeTab === 'inspiracoes' && <InspirationTab />}
      </main>
    </div>
  );
}
