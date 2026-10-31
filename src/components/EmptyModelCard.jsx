// src/components/EmptyModelCard.jsx
import { PlusCircle } from 'lucide-react';

export default function EmptyModelCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="card-mine cursor-pointer flex flex-col items-center justify-center py-16 px-6 text-center
                 hover:shadow-neon-lg transition-all duration-300 animate-pulse-neon"
    >
      <PlusCircle size={48} className="text-cyan-neon mb-4" />
      <h3 className="display-title text-2xl mb-2">Crie a sua modelo</h3>
      <p className="text-silver/60 text-sm">
        Adicione a foto, nome, trabalho, hobby e mais. Sua modelo vai aparecer no topo do feed!
      </p>
      <button className="btn-neon-filled mt-6">Começar agora</button>
    </div>
  );
}
