// scripts/seed.mjs
// Script para popular o banco com dados de exemplo e criar o usuário admin
// Uso: node scripts/seed.mjs
//
// IMPORTANTE: Antes de rodar, preencha o arquivo .env com as credenciais do Firebase
// e defina as variáveis ADMIN_NOME e ADMIN_SENHA abaixo (ou via argumentos).

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createRequire } from 'module';
import { readFileSync } from 'fs';

// ──────────────────────────────────────────────
// CONFIGURAÇÃO – edite aqui
// ──────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = './serviceAccountKey.json'; // baixe do Firebase Console
const ADMIN_NOME   = 'admin';           // nome de login do admin
const ADMIN_SENHA  = 'cowboy2024';      // senha do admin (mude após o primeiro login!)
// ──────────────────────────────────────────────

const fakeEmail = nome => `${nome.trim().toLowerCase().replace(/\s+/g, '_')}@sdg.local`;

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
} catch {
  console.error('❌  Arquivo serviceAccountKey.json não encontrado em ./scripts/');
  console.error('   Baixe em Firebase Console → Configurações → Contas de serviço → Gerar nova chave privada');
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });

const db   = getFirestore();
const auth = getAuth();

async function createUser(nome, senha, role) {
  const email = fakeEmail(nome);
  let uid;
  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    console.log(`  ↩ Usuário já existe: ${nome} (${uid})`);
  } catch {
    const cred = await auth.createUser({ email, password: senha, displayName: nome });
    uid = cred.uid;
    console.log(`  ✔ Criado: ${nome} (${uid})`);
  }
  await db.collection('usuarios').doc(uid).set({
    nome, email, role, createdAt: Timestamp.now(),
  }, { merge: true });
  return uid;
}

async function main() {
  console.log('\n🤠  SEED – SALA DE GUERRA\n');

  // ── Admin ──
  console.log('» Criando Admin...');
  const adminUid = await createUser(ADMIN_NOME, ADMIN_SENHA, 'admin');

  // ── Alunos ──
  console.log('\n» Criando Alunos...');
  const jessicaUid  = await createUser('jessica_lima',  'senha123', 'aluno');
  const rafaelUid   = await createUser('rafael_costa',  'senha123', 'aluno');
  const marinaUid   = await createUser('marina_souza',  'senha123', 'aluno');

  // ── Modelos ──
  console.log('\n» Criando Modelos...');

  await db.collection('modelos').doc(jessicaUid).set({
    userId: jessicaUid,
    nome: 'Sofia Mendes',
    idade: 24,
    trabalho: 'Arquiteta',
    hobby: 'Fotografia',
    subnicho: 'Lifestyle urbano',
    descricao: 'Apaixonada por design minimalista e cafés escondidos pelo centro.',
    fotoURL: '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  await db.collection('modelos').doc(rafaelUid).set({
    userId: rafaelUid,
    nome: 'Lara Vieira',
    idade: 22,
    trabalho: 'Designer UX',
    hobby: 'Yoga e corrida',
    subnicho: 'Fitness & bem-estar',
    descricao: 'Ama rotinas matutinas e compartilha dicas de produtividade.',
    fotoURL: '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  // Marina não cria modelo (para testar o estado vazio)

  // ── Curiosidades ──
  console.log('\n» Criando Curiosidades...');
  await db.collection('curiosidades').add({
    titulo: 'Por que o bio importa?',
    corpo: 'O bio é o seu cartão de visitas. Ele deve responder: quem é você, para quem você fala e o que a pessoa ganha seguindo você. Seja direto e use palavras do seu nicho.',
    createdAt: Timestamp.now(),
  });
  await db.collection('curiosidades').add({
    titulo: 'Consistência > Perfeição',
    corpo: 'Postar 3x por semana de forma consistente bate publicar o post "perfeito" uma vez por mês. O algoritmo premia a regularidade.',
    createdAt: Timestamp.now(),
  });

  // ── Perfis para Inspirar ──
  console.log('\n» Criando Perfis para Inspirar...');
  await db.collection('perfis_inspiracao').add({
    nome: 'Perfil Exemplo #1',
    fotoURL: '',
    link: 'https://instagram.com',
    motivo: 'Excelente uso de storytelling no feed com consistência visual impecável.',
    createdAt: Timestamp.now(),
  });

  console.log('\n✅  Seed concluído!\n');
  console.log('──────────────────────────────────────────');
  console.log(`🤠  ADMIN: nome="${ADMIN_NOME}" | senha="${ADMIN_SENHA}"`);
  console.log(`👤  jessica_lima / rafael_costa / marina_souza (senha: senha123)`);
  console.log('──────────────────────────────────────────\n');
}

main().catch(err => { console.error(err); process.exit(1); });
