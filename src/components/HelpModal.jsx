// src/components/HelpModal.jsx
import { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { X, Hand } from 'lucide-react';

export default function HelpModal({ modelo, pedidoAtual, onClose, onSaved }) {
  const { user, profile } = useAuth();
  const [topico, setTopico] = useState(pedidoAtual?.topico || '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!topico.trim()) { toast.error('Descreva o tópico de ajuda'); return; }
    setSaving(true);
    try {
      // Cancel previous pending if exists
      if (pedidoAtual?.id) {
        await updateDoc(doc(db, 'pedidos_ajuda', pedidoAtual.id), { status: 'Cancelado' });
      }

      const pedidoRef = await addDoc(collection(db, 'pedidos_ajuda'), {
        userId: user.uid,
        nomeAluno: profile?.nome || 'Aluno',
        modeloId: user.uid,
        nomeModelo: modelo?.nome || '',
        topico: topico.trim(),
        status: 'Pendente',
        createdAt: serverTimestamp(),
      });

      // Notificar admin
      const adminSnap = await getDocs(
        query(collection(db, 'usuarios'), where('role', '==', 'admin'))
      );
      for (const adminDoc of adminSnap.docs) {
        await addDoc(collection(db, 'notificacoes'), {
          adminId: adminDoc.id,
          tipo: 'pedido_ajuda',
          pedidoId: pedidoRef.id,
          nomeAluno: profile?.nome || 'Aluno',
          topico: topico.trim(),
          lida: false,
          createdAt: serverTimestamp(),
        });
      }

      toast.success('Pedido enviado! O Cowboy foi notificado 🤠');
      onSaved({ id: pedidoRef.id, topico: topico.trim(), status: 'Pendente' });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar pedido.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md card-mine rounded-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Hand size={22} className="text-cyan-neon" />
            <h2 className="display-title text-2xl">Preciso de Ajuda</h2>
          </div>
          <button onClick={onClose} className="text-silver hover:text-cyan-neon transition-colors">
            <X size={22} />
          </button>
        </div>

        {pedidoAtual && (
          <div className="mb-4 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl">
            <p className="text-yellow-400 text-sm">
              ⚠️ Você já tem um pedido <strong>Pendente</strong>: "{pedidoAtual.topico}".
              Salvar substituirá o atual.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm text-silver mb-2">
            Em qual tópico você precisa de ajuda?
          </label>
          <textarea
            value={topico}
            onChange={e => setTopico(e.target.value)}
            rows={4}
            placeholder="Ex: Não sei como abordar esse perfil, preciso de estratégia para..."
            className="input-neon resize-none"
            maxLength={500}
          />
          <p className="text-xs text-silver/40 mt-1 text-right">{topico.length}/500</p>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-neon flex-1">Cancelar</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-neon-filled flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Hand size={16} />
            {saving ? 'Enviando...' : 'Levantar a Mão'}
          </button>
        </div>
      </div>
    </div>
  );
}
