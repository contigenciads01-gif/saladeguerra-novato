// src/pages/AuthPage.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, LogIn, Shield, UserCheck, Sparkles } from 'lucide-react';
import CowboyLogo from '../components/CowboyLogo';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, cadastrar, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const cleanNome = nome.trim();
    if (!cleanNome || !senha.trim()) {
      toast.error('Preencha nome e senha');
      return;
    }
    if (!isLogin && senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(cleanNome, senha);
        toast.success(`Bem-vindo(a), ${cleanNome}!`);
        navigate('/');
      } else {
        await cadastrar(cleanNome, senha);
        toast.success(`Conta criada! Acesso liberado, ${cleanNome}!`);
        navigate('/');
      }
    } catch (err) {
      console.error('Erro na autenticação:', err);
      let msg = err.message || 'Erro ao autenticar';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'Usuário não encontrado. Crie sua conta na aba Cadastrar!';
      } else if (err.code === 'auth/wrong-password') {
        msg = 'Senha incorreta para esse usuário.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Esse nome já está em uso. Escolha outro ou clique em Entrar.';
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickFill(testNome, testSenha) {
    setNome(testNome);
    setSenha(testSenha);
    setIsLogin(true);
    toast('Credenciais preenchidas! Clique em Entrar.', { icon: '👉' });
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="fog-bg" />

      {/* Badge Modo de Conexão */}
      <div className="relative z-10 mb-4">
        {isFirebaseConfigured ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-neon/15 text-cyan-neon border border-cyan-neon/40 shadow-neon-sm">
            <Sparkles size={12} /> Conectado ao Firebase Cloud
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-silver/80 border border-cyan-neon/20">
            ⚡ Modo Local Ativo (Pronto para testes e cadastro)
          </span>
        )}
      </div>

      {/* Logo / Brand */}
      <div className="relative z-10 text-center mb-6">
        <div className="flex justify-center mb-3">
          <CowboyLogo size={80} className="drop-shadow-[0_0_15px_#00E5FF88]" />
        </div>
        <h1 className="display-title text-4xl md:text-5xl leading-tight">
          SALA DE GUERRA
        </h1>
        <p className="text-cyan-neon/60 text-xs tracking-[0.3em] uppercase mt-1">– ETAPA 1 –</p>
      </div>

      {/* Card Principal */}
      <div className="relative z-10 w-full max-w-sm card-neon p-6 md:p-8 animate-slide-up shadow-neon">
        {/* Toggle Entrar / Cadastrar */}
        <div className="flex rounded-xl overflow-hidden border border-cyan-neon/30 mb-6 bg-white/5">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-semibold transition-all duration-200 ${
              isLogin ? 'bg-cyan-neon text-bg shadow-neon-sm' : 'text-silver hover:text-ice'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-semibold transition-all duration-200 ${
              !isLogin ? 'bg-cyan-neon text-bg shadow-neon-sm' : 'text-silver hover:text-ice'
            }`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-silver mb-1.5">
              Nome de Guerra
            </label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: seu_nome ou admin"
              className="input-neon text-sm"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-silver mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder={isLogin ? '••••••••' : 'Mín. 6 caracteres'}
                className="input-neon pr-12 text-sm"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-cyan-neon transition-colors p-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-neon-filled w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50 text-sm py-2.5"
          >
            {loading ? (
              <span className="animate-pulse">Validando acesso...</span>
            ) : isLogin ? (
              <><LogIn size={18} /> Entrar na Sala</>
            ) : (
              <><UserPlus size={18} /> Criar Conta e Entrar</>
            )}
          </button>
        </form>

        {/* Acesso Rápido para Testes */}
        <div className="mt-6 pt-5 border-t border-cyan-neon/15">
          <p className="text-[11px] uppercase tracking-wider text-cyan-neon/70 mb-2.5 text-center font-semibold">
            Contas de Teste Prontas (1-clique):
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'cowboy2024')}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-white/5 hover:bg-cyan-neon/10 border border-cyan-neon/30 text-cyan-neon transition-all text-left"
            >
              <Shield size={14} className="flex-shrink-0" />
              <div className="truncate">
                <span className="font-bold block">admin</span>
                <span className="text-[10px] text-silver/60">Cowboy (Admin)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('jessica_lima', 'senha123')}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-white/5 hover:bg-cyan-neon/10 border border-cyan-neon/30 text-silver hover:text-cyan-neon transition-all text-left"
            >
              <UserCheck size={14} className="flex-shrink-0" />
              <div className="truncate">
                <span className="font-bold block text-ice">jessica_lima</span>
                <span className="text-[10px] text-silver/60">Aluna c/ Modelo</span>
              </div>
            </button>
          </div>
          <p className="text-[10px] text-silver/40 text-center mt-2.5">
            Ou crie qualquer novo aluno na aba <strong>Cadastrar</strong> acima.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #00E5FF08, transparent)' }} />
    </div>
  );
}
