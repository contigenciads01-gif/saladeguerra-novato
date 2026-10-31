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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg/95 backdrop-blur border-t border-cyan-neon/20
                    flex safe-bottom">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all duration-200
                      ${active === id
                        ? 'text-cyan-neon'
                        : 'text-silver/50 hover:text-silver'
                      }`}
        >
          <Icon size={20} className={active === id ? 'drop-shadow-[0_0_6px_#00E5FF]' : ''} />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </nav>
  );
}
