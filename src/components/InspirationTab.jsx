// src/components/InspirationTab.jsx
import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Star, Plus, Pencil, Trash2, Check, X, ExternalLink } from 'lucide-react';

function EditForm({ initial, onSave, onCancel }) {
  const [nome, setNome] = useState(initial?.nome || '');
  const [fotoURL, setFotoURL] = useState(initial?.fotoURL || '');
  const [link, setLink] = useState(initial?.link || '');
  const [motivo, setMotivo] = useState(initial?.motivo || '');
  return (
    <div className="space-y-3">
      <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do perfil" className="input-neon" />
      <input value={fotoURL} onChange={e => setFotoURL(e.target.value)} placeholder="URL da foto (opcional)" className="input-neon" />
      <input value={link} onChange={e => setLink(e.target.value)} placeholder="Link do perfil (opcional)" className="input-neon" />
      <input value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Por que inspira? (uma linha)" className="input-neon" />
      <div className="flex gap-2">
        <button onClick={() => onSave({ nome, fotoURL, link, motivo })} className="btn-neon-filled flex items-center gap-1 text-sm"><Check size={14}/> Salvar</button>
        <button onClick={onCancel} className="btn-neon flex items-center gap-1 text-sm"><X size={14}/> Cancelar</button>
      </div>
    </div>
  );
}

export default function InspirationTab() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'perfis_inspiracao'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  async function handleAdd(data) {
    if (!data.nome.trim()) { toast.error('Nome obrigatório'); return; }
    await addDoc(collection(db, 'perfis_inspiracao'), { ...data, createdAt: serverTimestamp() });
    toast.success('Perfil adicionado!');
    setAdding(false);
  }

  async function handleEdit(id, data) {
    await updateDoc(doc(db, 'perfis_inspiracao', id), { ...data, updatedAt: serverTimestamp() });
    toast.success('Atualizado!');
    setEditing(null);
  }

  async function handleDelete(id) {
    if (!confirm('Remover este perfil?')) return;
    await deleteDoc(doc(db, 'perfis_inspiracao', id));
    toast.success('Removido!');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="display-title text-2xl flex items-center gap-2"><Star size={20}/> Perfis para Inspirar</h2>
        {isAdmin && !adding && (
          <button onClick={() => setAdding(true)} className="btn-neon text-sm flex items-center gap-1">
            <Plus size={14}/> Novo
          </button>
        )}
      </div>

      {isAdmin && adding && (
        <div className="card-mine p-4">
          <EditForm onSave={handleAdd} onCancel={() => setAdding(false)} />
        </div>
      )}

      {items.length === 0 && !adding && (
        <p className="text-silver/40 text-center py-12">Nenhum perfil adicionado ainda.</p>
      )}

      <div className="grid grid-cols-1 gap-4">
        {items.map(item => (
          <div key={item.id} className="card-neon overflow-hidden">
            {editing === item.id ? (
              <div className="p-4">
                <EditForm initial={item} onSave={(d) => handleEdit(item.id, d)} onCancel={() => setEditing(null)} />
              </div>
            ) : (
              <div className="flex gap-4 p-4">
                {item.fotoURL ? (
                  <img src={item.fotoURL} alt={item.nome} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-cyan-neon/10 flex items-center justify-center flex-shrink-0">
                    <Star size={24} className="text-cyan-neon/50" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-ice">{item.nome}</h3>
                    <div className="flex gap-1 flex-shrink-0">
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer"
                           className="p-1.5 text-silver/60 hover:text-cyan-neon transition-colors">
                          <ExternalLink size={14}/>
                        </a>
                      )}
                      {isAdmin && (
                        <>
                          <button onClick={() => setEditing(item.id)} className="p-1.5 text-silver/60 hover:text-cyan-neon transition-colors"><Pencil size={14}/></button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-silver/60 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                        </>
                      )}
                    </div>
                  </div>
                  {item.motivo && <p className="text-silver/70 text-sm mt-1">{item.motivo}</p>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
