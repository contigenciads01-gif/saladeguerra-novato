// src/components/BottomNav.jsx
import { Home, Lightbulb, Star, User } from 'lucide-react';

const TABS = [
  { id: 'feed', label: 'Feed', icon: Home },
  { id: 'curiosidades', label: 'Curiosidades', icon: Lightbulb },
  { id: 'inspiracoes', label: 'Inspirações', icon: Star },
  { id: 'perfil', label: 'Meu Perfil', icon: User },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#06090F]/95 backdrop-blur-xl border-t border-cyan-neon/25 shadow-[0_-4px_25px_rgba(0,229,255,0.08)]">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-3">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-cyan-neon scale-105'
                  : 'text-silver/50 hover:text-silver/90'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-all ${
                  isActive ? 'bg-cyan-neon/15 shadow-neon-sm' : ''
                }`}
              >
                <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_#00E5FF]' : ''} />
              </div>
              <span
                className={`text-[10px] tracking-wider uppercase font-bold mt-1 ${
                  isActive ? 'text-cyan-neon' : 'text-silver/50'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
