// src/components/ModelCard.jsx
// Card de visualização (outros alunos)
import { User, Briefcase, Heart, Target, BookOpen } from 'lucide-react';

export default function ModelCard({ modelo, nomeAluno }) {
  if (!modelo) return null;

  return (
    <article className="card-neon overflow-hidden animate-fade-in bg-[#080D16] border border-cyan-neon/30 hover:border-cyan-neon/70 hover:shadow-neon transition-all duration-300">
      {/* Foto 4:5 */}
      <div className="relative w-full bg-black/50" style={{ paddingBottom: '125%' }}>
        {modelo.fotoURL ? (
          <img
            src={modelo.fotoURL}
            alt={modelo.nome}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-cyan-neon/5">
            <User size={56} className="text-silver/20" />
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="p-4 sm:p-5 space-y-3.5">
        <div className="flex items-baseline justify-between gap-2 border-b border-cyan-neon/15 pb-2.5">
          <h3 className="display-title text-xl text-ice">{modelo.nome}</h3>
          {modelo.idade > 0 && (
            <span className="text-cyan-neon/80 text-xs font-bold px-2 py-0.5 rounded bg-cyan-neon/10 border border-cyan-neon/20">
              {modelo.idade} anos
            </span>
          )}
        </div>

        <div className="space-y-2 text-xs">
          {modelo.trabalho && (
            <div className="flex items-center gap-2 text-silver">
              <div className="w-5 h-5 rounded bg-cyan-neon/10 flex items-center justify-center text-cyan-neon flex-shrink-0">
                <Briefcase size={12} />
              </div>
              <span>{modelo.trabalho}</span>
            </div>
          )}
          {modelo.hobby && (
            <div className="flex items-center gap-2 text-silver">
              <div className="w-5 h-5 rounded bg-cyan-neon/10 flex items-center justify-center text-cyan-neon flex-shrink-0">
                <Heart size={12} />
              </div>
              <span>{modelo.hobby}</span>
            </div>
          )}
          {modelo.subnicho && (
            <div className="flex items-center gap-2 text-silver">
              <div className="w-5 h-5 rounded bg-cyan-neon/10 flex items-center justify-center text-cyan-neon flex-shrink-0">
                <Target size={12} />
              </div>
              <span className="font-semibold text-cyan-neon/90">{modelo.subnicho}</span>
            </div>
          )}
          {modelo.descricao && (
            <div className="flex items-start gap-2 text-silver/70 pt-2 border-t border-white/5">
              <BookOpen size={12} className="text-cyan-neon/50 flex-shrink-0 mt-0.5" />
              <p className="line-clamp-3 italic leading-relaxed">{modelo.descricao}</p>
            </div>
          )}
        </div>

        <div className="pt-2.5 border-t border-cyan-neon/10 flex items-center justify-between text-xs">
          <span className="text-silver/40">Criado por:</span>
          <span className="text-silver/80 font-semibold">{nomeAluno}</span>
        </div>
      </div>
    </article>
  );
}
