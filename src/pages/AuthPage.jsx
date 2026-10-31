// src/pages/AuthPage.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, LogIn, Lock, User } from 'lucide-react';
import CowboyLogo from '../components/CowboyLogo';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, cadastrar } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const cleanNome = nome.trim();
    if (!cleanNome || !senha.trim()) {
      toast.error('Preencha o nome e a senha');
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
        toast.success(`Acesso liberado, ${cleanNome}!`);
        navigate('/');
      } else {
        await cadastrar(cleanNome, senha);
        toast.success(`Conta criada! Bem-vindo(a), ${cleanNome}!`);
        navigate('/');
      }
    } catch (err) {
      console.error('Erro de autenticação:', err);
      let msg = err.message || 'Erro ao autenticar';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'Usuário não encontrado. Se ainda não tem conta, selecione CADASTRAR.';
      } else if (err.code === 'auth/wrong-password') {
        msg = 'Senha incorreta para esse usuário.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Esse nome já está em uso. Escolha outro ou entre.';
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden selection:bg-cyan-neon selection:text-bg">
      {/* Efeito de névoa e luzes de fundo */}
      <div className="fog-bg" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-neon/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Marca / Identidade */}
      <div className="relative z-10 text-center mb-8">
        <div className="inline-flex justify-center p-3 rounded-2xl bg-white/[0.03] border border-cyan-neon/30 shadow-neon-sm mb-4 backdrop-blur-md">
          <CowboyLogo size={74} className="drop-shadow-[0_0_18px_#00E5FF99]" />
        </div>
        <h1 className="display-title text-4xl sm:text-5xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-ice via-cyan-neon to-cyan-soft drop-shadow-[0_0_12px_#00E5FF66]">
          SALA DE GUERRA
        </h1>
        <p className="text-cyan-neon/70 text-xs sm:text-sm font-semibold tracking-[0.35em] uppercase mt-1">
          – ETAPA 1 –
        </p>
      </div>

      {/* Card de Autenticação */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-[#090D14]/90 border border-cyan-neon/40 shadow-neon-lg p-6 sm:p-8 backdrop-blur-xl animate-slide-up">
        {/* Seletor Entrar / Cadastrar */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-black/50 border border-cyan-neon/20 mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`py-2 text-xs sm:text-sm font-bold tracking-wider uppercase rounded-lg transition-all duration-200 ${
              isLogin
                ? 'bg-cyan-neon text-bg shadow-neon-sm font-extrabold'
                : 'text-silver/70 hover:text-ice'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`py-2 text-xs sm:text-sm font-bold tracking-wider uppercase rounded-lg transition-all duration-200 ${
              !isLogin
                ? 'bg-cyan-neon text-bg shadow-neon-sm font-extrabold'
                : 'text-silver/70 hover:text-ice'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-neon/80 mb-1.5 flex items-center gap-1.5">
              <User size={13} /> Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Digite seu nome"
              className="input-neon text-sm bg-black/40"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-neon/80 mb-1.5 flex items-center gap-1.5">
              <Lock size={13} /> Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder={isLogin ? '••••••••' : 'Mínimo de 6 caracteres'}
                className="input-neon pr-12 text-sm bg-black/40"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-silver/60 hover:text-cyan-neon transition-colors p-1"
                aria-label="Mostrar ou ocultar senha"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-neon-filled w-full mt-6 py-3 text-sm flex items-center justify-center gap-2 uppercase tracking-wider font-extrabold shadow-neon hover:shadow-neon-lg active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Acessando...</span>
            ) : isLogin ? (
              <><LogIn size={18} /> Entrar na Sala</>
            ) : (
              <><UserPlus size={18} /> Criar Conta e Entrar</>
            )}
          </button>
        </form>
      </div>

      {/* Brilho inferior sutil */}
      <div
        className="fixed bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #00E5FF08, transparent)' }}
      />
    </div>
  );
}
