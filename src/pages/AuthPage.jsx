// src/pages/AuthPage.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';

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
    if (!nome.trim() || !senha.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (!isLogin && senha.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(nome, senha);
        // Navigation is handled by App.jsx route guard once profile loads
        toast.success(`Bem-vindo(a) de volta!`);
        navigate('/');
      } else {
        await cadastrar(nome, senha);
        toast.success(`Conta criada! Bem-vindo(a), ${nome}!`);
        navigate('/');
      }
    } catch (err) {
      const msg = err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
        ? 'Nome ou senha incorretos'
        : err.code === 'auth/email-already-in-use'
        ? 'Esse nome já está em uso'
        : 'Erro ao autenticar. Tente novamente.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="fog-bg" />

      {/* Logo / Brand */}
      <div className="relative z-10 text-center mb-10">
        {/* Cowboy silhouette SVG */}
        <div className="flex justify-center mb-4">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Hat */}
            <ellipse cx="40" cy="38" rx="28" ry="6" fill="#00E5FF" opacity="0.3"/>
            <rect x="24" y="18" width="32" height="20" rx="4" fill="#00E5FF"/>
            <rect x="16" y="34" width="48" height="6" rx="3" fill="#00E5FF"/>
            {/* Head */}
            <ellipse cx="40" cy="50" rx="10" ry="12" fill="#CBD5E1"/>
            {/* Body */}
            <path d="M24 62 Q40 58 56 62 L60 80 H20 Z" fill="#CBD5E1" opacity="0.8"/>
            {/* Glow */}
            <ellipse cx="40" cy="38" rx="28" ry="6" fill="none" stroke="#00E5FF" strokeWidth="1" opacity="0.6"/>
          </svg>
        </div>
        <h1 className="display-title text-4xl md:text-5xl leading-tight">
          SALA DE GUERRA
        </h1>
        <p className="text-cyan-neon/60 text-sm tracking-[0.3em] uppercase mt-1">– ETAPA 1 –</p>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm card-neon p-8 animate-slide-up">
        {/* Toggle */}
        <div className="flex rounded-xl overflow-hidden border border-cyan-neon/30 mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-semibold transition-all duration-200 ${
              isLogin ? 'bg-cyan-neon text-bg' : 'text-silver hover:text-ice'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-semibold transition-all duration-200 ${
              !isLogin ? 'bg-cyan-neon text-bg' : 'text-silver hover:text-ice'
            }`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-silver mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Seu nome de guerra"
              className="input-neon"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm text-silver mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder={isLogin ? '••••••••' : 'Mín. 6 caracteres'}
                className="input-neon pr-12"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-cyan-neon transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-neon-filled w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Aguarde...</span>
            ) : isLogin ? (
              <><LogIn size={18} /> Entrar na Sala</>
            ) : (
              <><UserPlus size={18} /> Criar Conta</>
            )}
          </button>
        </form>

        {!isLogin && (
          <p className="text-xs text-silver/50 text-center mt-4">
            Acesso liberado imediatamente após o cadastro.
          </p>
        )}
      </div>

      {/* Bottom glow */}
      <div className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #00E5FF08, transparent)' }} />
    </div>
  );
}
