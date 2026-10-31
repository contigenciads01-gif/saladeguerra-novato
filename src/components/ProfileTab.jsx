// src/components/ProfileTab.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogOut, User, Shield, KeyRound, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function ProfileTab() {
  const { profile, logout, isAdmin, alterarSenha } = useAuth();
  const navigate = useNavigate();

  const [mostrarAlterarSenha, setMostrarAlterarSenha] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  async function handleLogout() {
    await logout();
    toast.success('Até logo!');
    navigate('/auth');
  }

  async function handleSalvarSenha(e) {
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
      toast.success('Senha atualizada com sucesso!');
      setNovaSenha('');
      setConfirmarSenha('');
      setMostrarAlterarSenha(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Erro ao alterar a senha');
    } finally {
      setSalvandoSenha(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="display-title text-2xl flex items-center gap-2">
          <User size={22} className="text-cyan-neon" /> Meu Perfil
        </h2>
        {isAdmin && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-neon/15 border border-cyan-neon/40 text-cyan-neon font-bold flex items-center gap-1">
            <ShieldCheck size={12} /> Cowboy
          </span>
        )}
      </div>

      {/* Cartão de Identificação */}
      <div className="card-mine p-6 space-y-5 bg-gradient-to-b from-[#0D1520] to-[#070B12]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-neon/20 to-cyan-soft/10 border-2 border-cyan-neon flex items-center justify-center shadow-neon">
            {isAdmin ? (
              <Shield size={30} className="text-cyan-neon drop-shadow-[0_0_8px_#00E5FF]" />
            ) : (
              <User size={30} className="text-cyan-neon drop-shadow-[0_0_8px_#00E5FF]" />
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-ice tracking-wide">{profile?.nome}</h3>
            <span
              className={`inline-block mt-1 text-xs px-3 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isAdmin
                  ? 'bg-cyan-neon text-bg shadow-neon-sm'
                  : 'bg-white/10 text-silver border border-white/10'
              }`}
            >
              {isAdmin ? '🤠 CowBoy (Admin)' : '🎯 Aluno'}
            </span>
          </div>
        </div>

        <div className="border-t border-cyan-neon/15 pt-3">
          <p className="text-xs text-silver/50">
            Cadastrado na Sala de Guerra
          </p>
        </div>
      </div>

      {/* Seção Alterar Senha */}
      <div className="card-neon p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-neon/10 text-cyan-neon border border-cyan-neon/20">
              <KeyRound size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ice uppercase tracking-wider">Segurança</h4>
              <p className="text-xs text-silver/60">Altere sua senha de acesso a qualquer momento</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMostrarAlterarSenha(!mostrarAlterarSenha)}
            className="btn-neon text-xs py-1.5 px-3"
          >
            {mostrarAlterarSenha ? 'Fechar' : 'Alterar Senha'}
          </button>
        </div>

        {mostrarAlterarSenha && (
          <form onSubmit={handleSalvarSenha} className="pt-3 border-t border-cyan-neon/15 space-y-3 animate-slide-up">
            <div>
              <label className="block text-xs font-semibold text-silver mb-1">Nova Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="input-neon text-sm pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-silver/60 hover:text-cyan-neon"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-silver mb-1">Confirmar Nova Senha</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                placeholder="Repita a nova senha"
                className="input-neon text-sm"
                required
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={salvandoSenha}
                className="btn-neon-filled flex-1 py-2 text-xs flex items-center justify-center gap-1.5 uppercase font-bold"
              >
                <Check size={14} />
                {salvandoSenha ? 'Salvando...' : 'Salvar Nova Senha'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Atalho para o painel admin se for admin */}
      {isAdmin && (
        <a
          href="/admin"
          className="block card-neon p-4 text-center hover:shadow-neon hover:border-cyan-neon transition-all group"
        >
          <Shield size={22} className="text-cyan-neon mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <p className="text-cyan-neon font-bold text-sm uppercase tracking-wider">Acessar Painel do Cowboy</p>
        </a>
      )}

      {/* Botão de Logout */}
      <button
        onClick={handleLogout}
        className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60
                   py-3 rounded-xl font-bold flex items-center justify-center gap-2
                   transition-all duration-200 text-sm tracking-wider uppercase"
      >
        <LogOut size={16} />
        Sair da Sala
      </button>
    </div>
  );
}
