// src/components/EditModelModal.jsx
import { useState, useRef } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { X, Upload, User } from 'lucide-react';

const CAMPOS = [
  { key: 'nome', label: 'Nome da Modelo', placeholder: 'Ex: Sofia Mendes', maxLength: 60 },
  { key: 'idade', label: 'Idade', placeholder: 'Ex: 24', type: 'number', maxLength: 3 },
  { key: 'trabalho', label: 'Trabalho / Profissão', placeholder: 'Ex: Arquiteta', maxLength: 80 },
  { key: 'hobby', label: 'Hobby', placeholder: 'Ex: Fotografia', maxLength: 80 },
  { key: 'subnicho', label: 'Subnicho', placeholder: 'Ex: Lifestyle urbano', maxLength: 80 },
];

export default function EditModelModal({ modelo, onClose, onSaved }) {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    nome: modelo?.nome || '',
    idade: modelo?.idade || '',
    trabalho: modelo?.trabalho || '',
    hobby: modelo?.hobby || '',
    subnicho: modelo?.subnicho || '',
    descricao: modelo?.descricao || '',
  });
  const [preview, setPreview] = useState(modelo?.fotoURL || null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('Imagem máx. 5MB'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSave() {
    if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return; }
    setSaving(true);
    try {
      let fotoURL = modelo?.fotoURL || '';
      if (file) {
        const storageRef = ref(storage, `modelos/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        fotoURL = await getDownloadURL(storageRef);
      }
      const data = {
        ...form,
        idade: Number(form.idade) || 0,
        fotoURL,
        userId: user.uid,
        updatedAt: serverTimestamp(),
        createdAt: modelo?.createdAt || serverTimestamp(),
      };
      await setDoc(doc(db, 'modelos', user.uid), data);
      toast.success('Modelo salva!');
      onSaved({ ...data, fotoURL });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg card-mine rounded-2xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="display-title text-2xl">Editar Modelo</h2>
          <button onClick={onClose} className="text-silver hover:text-cyan-neon transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Foto */}
        <div className="flex flex-col items-center mb-6">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-40 h-48 rounded-2xl border-2 border-cyan-neon/40 hover:border-cyan-neon
                       overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-neon
                       flex items-center justify-center bg-white/5 relative group"
          >
            {preview ? (
              <img src={preview} alt="Prévia" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-silver/60">
                <User size={40} />
                <span className="text-xs">Adicionar foto</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity
                            flex items-center justify-center">
              <Upload size={24} className="text-cyan-neon" />
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <p className="text-xs text-silver/50 mt-2">Proporção 4:5 recomendada • Máx. 5MB</p>
        </div>

        {/* Campos */}
        <div className="space-y-4">
          {CAMPOS.map(c => (
            <div key={c.key}>
              <label className="block text-sm text-silver mb-1">{c.label}</label>
              <input
                type={c.type || 'text'}
                name={c.key}
                value={form[c.key]}
                onChange={handleChange}
                placeholder={c.placeholder}
                maxLength={c.maxLength}
                className="input-neon"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm text-silver mb-1">
              Descrição curta <span className="text-silver/40">({form.descricao.length}/200)</span>
            </label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              maxLength={200}
              rows={3}
              placeholder="Uma breve descrição da modelo..."
              className="input-neon resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-neon flex-1">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="btn-neon-filled flex-1 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar Modelo'}
          </button>
        </div>
      </div>
    </div>
  );
}
