// src/components/MyModelCard.jsx
// Card da modelo do próprio aluno (com editar + ajuda)
import { useState } from 'react';
import { User, Briefcase, Heart, Target, BookOpen, Pencil, Hand, Sparkles } from 'lucide-react';
import EditModelModal from './EditModelModal';
import HelpModal from './HelpModal';

export default function MyModelCard({ modelo, pedido, nomeAluno, onModeloUpdated, onPedidoUpdated }) {
  const [editOpen, setEditOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const hasPendente = pedido?.status === 'Pendente';

  return (
    <>
      <article className="card-mine overflow-hidden animate-slide-up relative bg-[#080D16] border-2 border-cyan-neon shadow-neon-lg">
        {/* Selos superiores */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
          <span className="bg-cyan-neon text-bg text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-neon flex items-center gap-1">
            <Sparkles size={12} /> Sua modelo
          </span>
          {hasPendente && (
            <span className="bg-yellow-400 text-bg text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-md animate-pulse flex items-center gap-1">
              <Hand size={12} /> Pedindo ajuda
            </span>
          )}
        </div>

        {/* Botão Editar Modelo */}
        <button
          onClick={() => setEditOpen(true)}
          className="absolute top-3 right-3 z-10 bg-black/80 hover:bg-cyan-neon hover:text-bg border border-cyan-neon/60 text-cyan-neon rounded-xl p-2.5 transition-all duration-200 shadow-neon hover:scale-105 active:scale-95"
          title="Editar dados e foto da modelo"
        >
          <Pencil size={16} />
        </button>

        {/* Foto proporção 4:5 */}
        <div className="relative w-full bg-black/60" style={{ paddingBottom: '125%' }}>
          {modelo?.fotoURL ? (
            <img
              src={modelo.fotoURL}
              alt={modelo?.nome}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-cyan-neon/10 to-transparent cursor-pointer group"
              onClick={() => setEditOpen(true)}
            >
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-cyan-neon/40 flex items-center justify-center group-hover:border-cyan-neon group-hover:shadow-neon transition-all">
                <User size={40} className="text-cyan-neon/60 group-hover:text-cyan-neon" />
              </div>
              <p className="text-cyan-neon text-xs font-bold tracking-wider uppercase mt-3 group-hover:drop-shadow-[0_0_8px_#00E5FF]">
                Clique para adicionar foto
              </p>
            </div>
          )}
        </div>

        {/* Informações da modelo */}
        <div className="p-5 space-y-4">
          {modelo ? (
            <>
              <div className="flex items-baseline justify-between gap-2 border-b border-cyan-neon/15 pb-3">
                <h3 className="display-title text-2xl text-transparent bg-clip-text bg-gradient-to-r from-ice to-cyan-neon">
                  {modelo.nome}
                </h3>
                {modelo.idade > 0 && (
                  <span className="text-cyan-neon text-sm font-bold px-2 py-0.5 rounded-md bg-cyan-neon/10 border border-cyan-neon/30">
                    {modelo.idade} anos
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                {modelo.trabalho && (
                  <div className="flex items-center gap-2.5 text-silver">
                    <div className="w-5 h-5 rounded-md bg-cyan-neon/10 flex items-center justify-center text-cyan-neon flex-shrink-0">
                      <Briefcase size={12} />
                    </div>
                    <span className="font-medium">{modelo.trabalho}</span>
                  </div>
                )}
                {modelo.hobby && (
                  <div className="flex items-center gap-2.5 text-silver">
                    <div className="w-5 h-5 rounded-md bg-cyan-neon/10 flex items-center justify-center text-cyan-neon flex-shrink-0">
                      <Heart size={12} />
                    </div>
                    <span className="font-medium">{modelo.hobby}</span>
                  </div>
                )}
                {modelo.subnicho && (
                  <div className="flex items-center gap-2.5 text-silver">
                    <div className="w-5 h-5 rounded-md bg-cyan-neon/10 flex items-center justify-center text-cyan-neon flex-shrink-0">
                      <Target size={12} />
                    </div>
                    <span className="font-semibold text-cyan-neon/90">{modelo.subnicho}</span>
                  </div>
                )}
                {modelo.descricao && (
                  <div className="flex items-start gap-2.5 text-silver/80 pt-2 border-t border-white/5">
                    <BookOpen size={13} className="text-cyan-neon/60 flex-shrink-0 mt-0.5" />
                    <p className="italic leading-relaxed">{modelo.descricao}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              onClick={() => setEditOpen(true)}
              className="py-6 text-center cursor-pointer rounded-xl bg-white/[0.02] border border-dashed border-cyan-neon/20 hover:border-cyan-neon transition-all"
            >
              <p className="text-silver/60 text-xs font-semibold">
                Clique aqui ou no botão Editar para preencher o perfil da sua modelo
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-cyan-neon/20 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-silver/50">Aluno responsável:</span>
              <span className="text-cyan-neon font-bold">{nomeAluno}</span>
            </div>

            <button
              onClick={() => setHelpOpen(true)}
              className="w-full btn-neon py-2.5 text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-neon-sm hover:shadow-neon"
            >
              <Hand size={16} />
              🖐 Preciso de Ajuda
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
