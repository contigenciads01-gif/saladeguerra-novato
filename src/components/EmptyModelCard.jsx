// src/components/EmptyModelCard.jsx
import { PlusCircle, Sparkles } from 'lucide-react';

export default function EmptyModelCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="card-mine cursor-pointer flex flex-col items-center justify-center py-14 px-6 text-center
                 border-2 border-dashed border-cyan-neon hover:border-cyan-neon/100 bg-gradient-to-b from-[#0B121C] to-[#070B12]
                 hover:shadow-neon-lg transition-all duration-300 group rounded-2xl"
    >
      <div className="w-16 h-16 rounded-2xl bg-cyan-neon/10 border border-cyan-neon/40 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-neon transition-all">
        <PlusCircle size={36} className="text-cyan-neon" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-neon/15 border border-cyan-neon/30 text-[10px] uppercase tracking-widest text-cyan-neon font-black mb-2">
        <Sparkles size={11} /> Primeiro Passo
      </div>

      <h3 className="display-title text-3xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-ice to-cyan-neon">
        Crie a sua modelo
      </h3>

      <p className="text-silver/70 text-xs sm:text-sm max-w-xs leading-relaxed mb-6">
        Adicione a foto 4:5, idade, profissão, hobby, subnicho e bio. A sua modelo aparecerá em destaque no topo da Sala de Guerra!
      </p>

      <button className="btn-neon-filled py-2.5 px-6 text-xs uppercase tracking-wider font-extrabold shadow-neon group-hover:shadow-neon-lg">
        + Cadastrar Minha Modelo
      </button>
    </div>
  );
}
