// src/components/MyModelCard.jsx
// Card da modelo do próprio aluno (com editar + ajuda)
import { useState } from 'react';
import { User, Briefcase, Heart, Target, BookOpen, Pencil, Hand } from 'lucide-react';
import EditModelModal from './EditModelModal';
import HelpModal from './HelpModal';

export default function MyModelCard({ modelo, pedido, nomeAluno, onModeloUpdated, onPedidoUpdated }) {
  const [editOpen, setEditOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const hasPendente = pedido?.status === 'Pendente';

  return (
    <>
      <article className="card-mine overflow-hidden animate-slide-up relative">
        {/* Selo "Sua modelo" */}
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <span className="bg-cyan-neon text-bg text-xs font-bold px-3 py-1 rounded-full shadow-neon">
            ⭐ Sua modelo
          </span>
          {hasPendente && (
            <span className="bg-yellow-400/20 border border-yellow-400/50 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
              🖐 Pedindo ajuda
            </span>
          )}
        </div>

        {/* Botão editar */}
        <button
          onClick={() => setEditOpen(true)}
          className="absolute top-3 right-3 z-10 bg-black/60 border border-cyan-neon/40 hover:border-cyan-neon
                     text-cyan-neon rounded-xl p-2 transition-all duration-200 hover:shadow-neon"
        >
          <Pencil size={16} />
        </button>

        {/* Foto 4:5 */}
        <div className="relative w-full" style={{ paddingBottom: '125%' }}>
          {modelo?.fotoURL ? (
            <img
              src={modelo.fotoURL}
              alt={modelo?.nome}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center bg-cyan-neon/5 cursor-pointer"
              onClick={() => setEditOpen(true)}
            >
              <User size={64} className="text-cyan-neon/30" />
              <p className="text-cyan-neon/50 text-sm mt-2">Adicionar foto</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-3">
          {modelo ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <h3 className="display-title text-xl leading-none">{modelo.nome}</h3>
                {modelo.idade > 0 && (
                  <span className="text-cyan-neon text-sm font-semibold whitespace-nowrap">{modelo.idade} anos</span>
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
                    <span>{modelo.descricao}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              onClick={() => setEditOpen(true)}
              className="py-4 text-center cursor-pointer"
            >
              <p className="text-silver/60 text-sm">Clique em Editar para adicionar os dados da sua modelo</p>
            </div>
          )}

          <div className="pt-2 border-t border-cyan-neon/20 space-y-2">
            <p className="text-xs text-silver/50">
              Aluno: <span className="text-cyan-neon/80">{nomeAluno}</span>
            </p>
            <button
              onClick={() => setHelpOpen(true)}
              className="w-full btn-neon text-sm flex items-center justify-center gap-2"
            >
              <Hand size={16} />
              Preciso de Ajuda
            </button>
          </div>
        </div>
      </article>

      {editOpen && (
        <EditModelModal
          modelo={modelo}
          onClose={() => setEditOpen(false)}
          onSaved={onModeloUpdated}
        />
      )}
      {helpOpen && (
        <HelpModal
          modelo={modelo}
          pedidoAtual={pedido}
          onClose={() => setHelpOpen(false)}
          onSaved={onPedidoUpdated}
        />
      )}
    </>
  );
}
