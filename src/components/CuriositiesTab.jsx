// src/components/CuriositiesTab.jsx
import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Lightbulb, Plus, Pencil, Trash2, Check, X } from 'lucide-react';

function EditForm({ initial, onSave, onCancel }) {
  const [titulo, setTitulo] = useState(initial?.titulo || '');
  const [corpo, setCorpo] = useState(initial?.corpo || '');
  return (
    <div className="space-y-3">
      <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" className="input-neon" />
      <textarea value={corpo} onChange={e => setCorpo(e.target.value)} rows={3} placeholder="Conteúdo da dica..." className="input-neon resize-none" />
      <div className="flex gap-2">
        <button onClick={() => onSave({ titulo, corpo })} className="btn-neon-filled flex items-center gap-1 text-sm"><Check size={14}/> Salvar</button>
        <button onClick={onCancel} className="btn-neon flex items-center gap-1 text-sm"><X size={14}/> Cancelar</button>
      </div>
    </div>
  );
}

export default function CuriositiesTab() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'curiosidades'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  async function handleAdd({ titulo, corpo }) {
    if (!titulo.trim()) { toast.error('Título obrigatório'); return; }
    await addDoc(collection(db, 'curiosidades'), { titulo, corpo, createdAt: serverTimestamp() });
    toast.success('Curiosidade adicionada!');
    setAdding(false);
  }

  async function handleEdit(id, { titulo, corpo }) {
    await updateDoc(doc(db, 'curiosidades', id), { titulo, corpo, updatedAt: serverTimestamp() });
    toast.success('Atualizado!');
    setEditing(null);
  }

  async function handleDelete(id) {
    if (!confirm('Remover esta curiosidade?')) return;
    await deleteDoc(doc(db, 'curiosidades', id));
    toast.success('Removido!');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="display-title text-2xl flex items-center gap-2"><Lightbulb size={20}/> Curiosidades</h2>
        {isAdmin && !adding && (
          <button onClick={() => setAdding(true)} className="btn-neon text-sm flex items-center gap-1">
            <Plus size={14}/> Nova
          </button>
        )}
      </div>

      {isAdmin && adding && (
        <div className="card-mine p-4">
          <EditForm onSave={handleAdd} onCancel={() => setAdding(false)} />
        </div>
      )}

      {items.length === 0 && !adding && (
        <p className="text-silver/40 text-center py-12">Nenhuma curiosidade ainda.</p>
      )}

      {items.map(item => (
        <div key={item.id} className="card-neon p-4 space-y-2">
          {editing === item.id ? (
            <EditForm initial={item} onSave={(d) => handleEdit(item.id, d)} onCancel={() => setEditing(null)} />
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-cyan-neon text-base">{item.titulo}</h3>
                {isAdmin && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setEditing(item.id)} className="p-1.5 text-silver/60 hover:text-cyan-neon transition-colors"><Pencil size={14}/></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-silver/60 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                  </div>
                )}
              </div>
              {item.corpo && <p className="text-silver/80 text-sm leading-relaxed">{item.corpo}</p>}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
