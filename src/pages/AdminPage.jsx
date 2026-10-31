// src/pages/AdminPage.jsx
import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  db
} from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CowboyLogo from '../components/CowboyLogo';
import CuriositiesTab from '../components/CuriositiesTab';
import InspirationTab from '../components/InspirationTab';
import {
  Bell,
  Users,
  Image,
  Hand,
  CheckCircle,
  Clock,
  Home,
  Lightbulb,
  Star,
  LogOut,
  ChevronRight,
  X,
  KeyRound,
  Eye,
  EyeOff,
  LayoutGrid
} from 'lucide-react';

const STATUS_COLOR = {
  Pendente: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10',
  'Em andamento': 'text-blue-400 border-blue-400/40 bg-blue-400/10',
  Resolvido: 'text-green-400 border-green-400/40 bg-green-400/10',
  Cancelado: 'text-silver/40 border-silver/20 bg-white/5',
};

function MetricCard({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`card-neon p-4 flex items-center gap-3 bg-gradient-to-br from-white/[0.04] to-transparent ${
      highlight ? 'border-cyan-neon shadow-neon-sm' : ''
    }`}>
      <div className="w-11 h-11 rounded-xl bg-cyan-neon/10 border border-cyan-neon/30 flex items-center justify-center flex-shrink-0 shadow-neon-sm">
        <Icon size={22} className="text-cyan-neon" />
      </div>
      <div>
        <p className="text-2xl font-black text-ice leading-none tracking-wide">{value}</p>
        <p className="text-[11px] uppercase tracking-wider text-silver/60 mt-1 font-semibold">{label}</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { logout, profile, alterarSenha } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('visao');
  const [alunos, setAlunos] = useState([]);
  const [modelos, setModelos] = useState({});
  const [pedidos, setPedidos] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);

  // Modal Alterar Senha Cowboy
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  // Alunos
  useEffect(() => {
    const q = query(collection(db, 'usuarios'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setAlunos(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => u.role !== 'admin' && u.nome?.toLowerCase() !== 'cowboy')
      );
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

  // Pedidos de ajuda
  useEffect(() => {
    const q = query(collection(db, 'pedidos_ajuda'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setPedidos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // Notificações
  useEffect(() => {
    const q = query(collection(db, 'notificacoes'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setNotificacoes(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(n => !n.lida)
      );
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

  async function handleSalvarSenhaAdmin(e) {
    e.preventDefault();
    if (!novaSenha.trim()) {
      toast.error('Digite a nova senha');
      return;
    }
    if (novaSenha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    setSalvandoSenha(true);
    try {
      await alterarSenha(novaSenha.trim());
      toast.success('Senha do CowBoy atualizada com sucesso!');
      setNovaSenha('');
      setConfirmarSenha('');
      setPassModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Erro ao alterar a senha');
    } finally {
      setSalvandoSenha(false);
    }
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
    { id: 'pedidos', label: 'Pedidos de Ajuda', icon: Hand },
    { id: 'curiosidades', label: 'Curiosidades', icon: Lightbulb },
    { id: 'inspiracoes', label: 'Inspirações', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-bg relative selection:bg-cyan-neon selection:text-bg">
      <div className="fog-bg" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#070B12]/95 backdrop-blur-md border-b border-cyan-neon/30 px-4 py-3 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CowboyLogo size={36} className="drop-shadow-[0_0_10px_#00E5FF]" />
            <div>
              <h1 className="display-title text-xl leading-none text-transparent bg-clip-text bg-gradient-to-r from-ice to-cyan-neon">
                PAINEL DO COWBOY
              </h1>
              <p className="text-[10px] text-cyan-neon/70 font-bold tracking-widest uppercase mt-0.5">
                COMANDO & MONITORAMENTO
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Ir para o Feed */}
            <a
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border border-cyan-neon/30 text-cyan-neon hover:bg-cyan-neon/10 transition-all"
            >
              <LayoutGrid size={14} /> Feed de Alunos
            </a>

            {/* Alterar Senha */}
            <button
              onClick={() => setPassModalOpen(true)}
              className="p-2 rounded-xl border border-cyan-neon/30 text-silver hover:text-cyan-neon hover:border-cyan-neon transition-all"
              title="Alterar Senha do Admin"
            >
              <KeyRound size={17} />
            </button>

            {/* Sino de Notificações */}
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl border border-cyan-neon/30 hover:border-cyan-neon text-silver hover:text-cyan-neon transition-all"
              title="Notificações"
            >
              <Bell size={17} />
              {notifsNaoLidas > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-neon text-bg text-[10px] font-black rounded-full flex items-center justify-center shadow-neon animate-pulse">
                  {notifsNaoLidas > 9 ? '9+' : notifsNaoLidas}
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-all"
              title="Sair"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* Painel de Notificações Dropdown */}
      {notifOpen && (
        <div className="fixed top-16 right-4 z-50 w-80 sm:w-96 card-mine rounded-2xl p-4 shadow-neon-lg animate-slide-up max-h-[80vh] overflow-y-auto bg-[#070B12]/95 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-neon/20">
            <h3 className="font-bold text-cyan-neon text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Bell size={15} /> Notificações
            </h3>
            <div className="flex gap-2 items-center">
              {notifsNaoLidas > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-semibold text-silver/70 hover:text-cyan-neon transition-colors"
                >
                  Marcar todas lidas
                </button>
              )}
              <button
                onClick={() => setNotifOpen(false)}
                className="text-silver/60 hover:text-ice p-1"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {notificacoes.length === 0 ? (
            <p className="text-silver/40 text-xs text-center py-6">Nenhuma nova notificação pendente.</p>
          ) : (
            <div className="space-y-2">
              {notificacoes.map(n => (
                <div key={n.id} className="bg-white/[0.04] border border-cyan-neon/20 rounded-xl p-3 flex items-start gap-2.5">
                  <Hand size={16} className="text-cyan-neon mt-0.5 flex-shrink-0" />
                  <div className="flex-1 text-xs">
                    <p className="text-ice">
                      <strong>{n.nomeAluno}</strong> levantou a mão!
                    </p>
                    <p className="text-silver/70 text-[11px] mt-1 line-clamp-2 italic">
                      "{n.topico}"
                    </p>
                  </div>
                  <button
                    onClick={() => markNotifRead(n.id)}
                    className="p-1 text-silver/40 hover:text-cyan-neon transition-colors flex-shrink-0"
                    title="Marcar como lida"
                  >
                    <CheckCircle size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs de navegação do Admin */}
      <div className="sticky top-[58px] z-20 bg-[#05070A]/90 backdrop-blur border-b border-cyan-neon/15">
        <div className="max-w-3xl mx-auto px-4 flex gap-1.5 overflow-x-auto py-2.5 scrollbar-hide">
          {ADMIN_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'bg-cyan-neon text-bg shadow-neon-sm'
                  : 'text-silver/70 hover:text-ice bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-cyan-neon/20'
              }`}
            >
              <Icon size={14} /> {label}
              {id === 'pedidos' && pendentes > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === id ? 'bg-bg text-cyan-neon' : 'bg-yellow-400 text-bg shadow-sm'
                  }`}
                >
                  {pendentes}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="max-w-3xl mx-auto px-4 pt-6 pb-16 relative z-10">
        {/* ── VISÃO GERAL ── */}
        {activeTab === 'visao' && (
          <div className="space-y-6 animate-fade-in">
            {/* Métricas */}
            <div className="grid grid-cols-3 gap-3">
              <MetricCard icon={Users} label="Alunos" value={totalAlunos} />
              <MetricCard icon={Image} label="Modelos" value={totalModelos} />
              <MetricCard
                icon={Hand}
                label="Ajuda Pendente"
                value={pendentes}
                highlight={pendentes > 0}
              />
            </div>

            {/* Lista de Alunos e Modelos */}
            <div className="card-neon p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="display-title text-xl flex items-center gap-2">
                  <Users size={18} className="text-cyan-neon" /> Alunos Cadastrados
                </h2>
                <span className="text-xs text-silver/50 font-semibold">{totalAlunos} total</span>
              </div>

              {alunos.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl bg-white/[0.02] border border-dashed border-cyan-neon/20">
                  <Users size={36} className="text-silver/20 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-silver/60">Nenhum aluno cadastrado ainda.</p>
                  <p className="text-xs text-silver/40 mt-1">
                    Assim que novos alunos se cadastrarem na tela inicial, eles aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alunos.map(aluno => {
                    const modelo = modelos[aluno.id];
                    const isSelected = selectedAluno === aluno.id;

                    return (
                      <div key={aluno.id} className="space-y-2">
                        <div
                          onClick={() => setSelectedAluno(isSelected ? null : aluno.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'bg-cyan-neon/10 border-cyan-neon shadow-neon-sm'
                              : 'bg-white/[0.02] border-cyan-neon/20 hover:border-cyan-neon/50'
                          }`}
                        >
                          {modelo?.fotoURL ? (
                            <img
                              src={modelo.fotoURL}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover border border-cyan-neon/30 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-cyan-neon/5 border border-cyan-neon/20 flex items-center justify-center flex-shrink-0">
                              <Users size={20} className="text-silver/40" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-ice text-sm truncate">{aluno.nome}</p>
                            {modelo ? (
                              <p className="text-xs text-cyan-neon/80 truncate">
                                Modelo: <strong className="text-ice">{modelo.nome}</strong> • {modelo.subnicho || modelo.trabalho}
                              </p>
                            ) : (
                              <p className="text-xs text-silver/40 italic">Nenhuma modelo criada ainda</p>
                            )}
                          </div>

                          <ChevronRight
                            size={16}
                            className={`text-silver/40 transition-transform ${isSelected ? 'rotate-90 text-cyan-neon' : ''}`}
                          />
                        </div>

                        {/* Detalhe da Modelo Aberto */}
                        {isSelected && (
                          <div className="p-4 rounded-xl bg-[#090E17] border border-cyan-neon/40 shadow-neon-sm space-y-3 animate-slide-up">
                            {modelo ? (
                              <div className="flex flex-col sm:flex-row gap-4">
                                {modelo.fotoURL && (
                                  <img
                                    src={modelo.fotoURL}
                                    alt={modelo.nome}
                                    className="w-full sm:w-36 h-48 rounded-xl object-cover border border-cyan-neon/40 flex-shrink-0"
                                  />
                                )}
                                <div className="space-y-2 flex-1 text-xs">
                                  <h3 className="display-title text-xl text-cyan-neon">{modelo.nome}</h3>
                                  <div className="grid grid-cols-2 gap-2 text-silver">
                                    <p><strong className="text-cyan-neon/70">Idade:</strong> {modelo.idade || '—'}</p>
                                    <p><strong className="text-cyan-neon/70">Trabalho:</strong> {modelo.trabalho || '—'}</p>
                                    <p><strong className="text-cyan-neon/70">Hobby:</strong> {modelo.hobby || '—'}</p>
                                    <p><strong className="text-cyan-neon/70">Subnicho:</strong> {modelo.subnicho || '—'}</p>
                                  </div>
                                  {modelo.descricao && (
                                    <p className="p-2.5 rounded-lg bg-black/40 text-silver/80 italic mt-2 border border-white/5">
                                      "{modelo.descricao}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-silver/50 text-center py-2">
                                Este aluno ainda não criou sua modelo no Feed.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PEDIDOS DE AJUDA ── */}
        {activeTab === 'pedidos' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="display-title text-2xl flex items-center gap-2">
                <Hand size={20} className="text-cyan-neon" /> Pedidos de Ajuda
              </h2>
              {pendentes > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-400/20 text-yellow-400 border border-yellow-400/40">
                  {pendentes} pendente{pendentes > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {pedidos.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-dashed border-cyan-neon/20">
                <Hand size={36} className="text-silver/20 mx-auto mb-2" />
                <p className="text-sm font-semibold text-silver/60">Nenhum pedido de ajuda registrado.</p>
                <p className="text-xs text-silver/40 mt-1">
                  Quando um aluno clicar em "🖐 Preciso de ajuda", o pedido surgirá aqui.
                </p>
              </div>
            ) : (
              ['Pendente', 'Em andamento', 'Resolvido', 'Cancelado'].map(status => {
                const grupo = pedidos.filter(p => p.status === status);
                if (grupo.length === 0) return null;

                return (
                  <div key={status} className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-silver/60 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        status === 'Pendente' ? 'bg-yellow-400 shadow-neon-sm' :
                        status === 'Em andamento' ? 'bg-blue-400' :
                        status === 'Resolvido' ? 'bg-green-400' : 'bg-silver/40'
                      }`} />
                      {status} ({grupo.length})
                    </h3>

                    <div className="space-y-3">
                      {grupo.map(p => (
                        <div
                          key={p.id}
                          className={`card-neon p-4 space-y-3 ${
                            status === 'Pendente' ? 'border-yellow-400/50 shadow-neon-sm' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-ice text-sm">{p.nomeAluno}</p>
                              {p.nomeModelo && (
                                <p className="text-xs text-cyan-neon/80 font-medium">
                                  Modelo: {p.nomeModelo}
                                </p>
                              )}
                              <p className="text-[10px] text-silver/40 mt-0.5">{formatDate(p.createdAt)}</p>
                            </div>
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_COLOR[p.status]}`}>
                              {p.status}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-silver/90 leading-relaxed">
                            {p.topico}
                          </div>

                          {(p.status === 'Pendente' || p.status === 'Em andamento') && (
                            <div className="flex gap-2 pt-1">
                              {p.status === 'Pendente' && (
                                <button
                                  onClick={() => updatePedidoStatus(p.id, 'Em andamento')}
                                  className="btn-neon text-xs py-1.5 px-3 flex items-center gap-1.5"
                                >
                                  <Clock size={13} /> Em andamento
                                </button>
                              )}
                              <button
                                onClick={() => updatePedidoStatus(p.id, 'Resolvido')}
                                className="btn-neon-filled text-xs py-1.5 px-3 flex items-center gap-1.5"
                              >
                                <CheckCircle size={13} /> Marcar como Resolvido
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── CURIOSIDADES & INSPIRAÇÕES ── */}
        {activeTab === 'curiosidades' && <CuriositiesTab />}
        {activeTab === 'inspiracoes' && <InspirationTab />}
      </main>

      {/* Modal Alterar Senha do CowBoy */}
      {passModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm card-mine rounded-2xl p-6 space-y-4 shadow-neon-lg animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-cyan-neon/20">
              <h3 className="display-title text-xl flex items-center gap-2">
                <KeyRound size={20} className="text-cyan-neon" /> Alterar Senha
              </h3>
              <button
                onClick={() => setPassModalOpen(false)}
                className="text-silver/60 hover:text-cyan-neon"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvarSenhaAdmin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-silver mb-1">
                  Nova Senha do CowBoy
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="input-neon text-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-silver/60 hover:text-cyan-neon p-1"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-silver mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="input-neon text-sm"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPassModalOpen(false)}
                  className="btn-neon flex-1 text-xs py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoSenha}
                  className="btn-neon-filled flex-1 text-xs py-2 uppercase font-extrabold"
                >
                  {salvandoSenha ? 'Salvando...' : 'Atualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
