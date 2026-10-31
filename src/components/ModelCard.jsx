// src/components/ModelCard.jsx
// Card de visualização (outros alunos)
import { User, Briefcase, Heart, Target, BookOpen } from 'lucide-react';

export default function ModelCard({ modelo, nomeAluno }) {
  if (!modelo) return null;

  return (
    <article className="card-neon overflow-hidden animate-fade-in">
      {/* Foto 4:5 */}
      <div className="relative w-full" style={{ paddingBottom: '125%' }}>
        {modelo.fotoURL ? (
          <img
            src={modelo.fotoURL}
            alt={modelo.nome}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
            <User size={64} className="text-silver/30" />
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="display-title text-xl leading-none">{modelo.nome}</h3>
          {modelo.idade > 0 && (
            <span className="text-cyan-neon/70 text-sm font-semibold whitespace-nowrap">{modelo.idade} anos</span>
          )}
        </div>

        <div className="space-y-1.5">
          {modelo.trabalho && (
            <div className="flex items-center gap-2 text-sm text-silver">
              <Briefcase size={13} className="text-cyan-neon/70 flex-shrink-0" />
              <span>{modelo.trabalho}</span>
            </div>
          )}
          {modelo.hobby && (
            <div className="flex items-center gap-2 text-sm text-silver">
              <Heart size={13} className="text-cyan-neon/70 flex-shrink-0" />
              <span>{modelo.hobby}</span>
            </div>
          )}
          {modelo.subnicho && (
            <div className="flex items-center gap-2 text-sm text-silver">
              <Target size={13} className="text-cyan-neon/70 flex-shrink-0" />
              <span>{modelo.subnicho}</span>
            </div>
          )}
          {modelo.descricao && (
            <div className="flex items-start gap-2 text-sm text-silver/70 pt-1">
              <BookOpen size={13} className="text-cyan-neon/50 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-3">{modelo.descricao}</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-cyan-neon/10">
          <p className="text-xs text-silver/50">
            Aluno: <span className="text-silver/80">{nomeAluno}</span>
          </p>
        </div>
      </div>
    </article>
  );
}
