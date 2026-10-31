// src/components/ProfileTab.jsx
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogOut, User, Shield } from 'lucide-react';

export default function ProfileTab() {
  const { profile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success('Até logo!');
    navigate('/auth');
  }

  return (
    <div className="space-y-6">
      <h2 className="display-title text-2xl flex items-center gap-2"><User size={20}/> Meu Perfil</h2>

      <div className="card-mine p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-cyan-neon/20 border-2 border-cyan-neon
                          flex items-center justify-center shadow-neon">
            {isAdmin
              ? <Shield size={28} className="text-cyan-neon" />
              : <User size={28} className="text-cyan-neon" />
            }
          </div>
          <div>
            <h3 className="text-xl font-bold text-ice">{profile?.nome}</h3>
            <span className={`text-sm px-3 py-0.5 rounded-full font-semibold ${
              isAdmin
                ? 'bg-cyan-neon/20 text-cyan-neon border border-cyan-neon/50'
                : 'bg-white/10 text-silver'
            }`}>
              {isAdmin ? '🤠 Cowboy (Admin)' : '🎯 Aluno'}
            </span>
          </div>
        </div>

        <div className="border-t border-cyan-neon/20 pt-4">
          <p className="text-sm text-silver/60">
            Membro desde {profile?.createdAt?.toDate?.()?.toLocaleDateString('pt-BR') || '—'}
          </p>
        </div>
      </div>

      {isAdmin && (
        <a href="/admin" className="block card-neon p-4 text-center hover:shadow-neon transition-all">
          <Shield size={20} className="text-cyan-neon mx-auto mb-2" />
          <p className="text-cyan-neon font-semibold">Ir para o Painel do Cowboy</p>
        </a>
      )}

      <button
        onClick={handleLogout}
        className="w-full border border-red-500/40 text-red-400 hover:bg-red-500/10
                   py-3 rounded-xl font-semibold flex items-center justify-center gap-2
                   transition-all duration-200"
      >
        <LogOut size={18} />
        Sair da Sala
      </button>
    </div>
  );
}
