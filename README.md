# 🤠 SALA DE GUERRA – ETAPA 1

Plataforma-dashboard estilo rede social para gerenciamento de modelos por alunos, com identidade visual neon ciano cinematográfico.

---

## Pré-requisitos

- Node.js 18+
- Conta no [Firebase](https://firebase.google.com/)

---

## 1. Configurar o Firebase

### 1.1 Criar o projeto
1. Acesse [console.firebase.google.com](https://console.firebase.google.com/)
2. Clique em **Adicionar projeto** → dê um nome (ex: `sala-de-guerra`)
3. Desabilite Google Analytics (opcional)

### 1.2 Habilitar serviços
Dentro do projeto:
- **Authentication** → Método de login → **E-mail/senha** → Ativar
- **Firestore Database** → Criar banco → Modo **produção**
- **Storage** → Começar → Modo **produção**

### 1.3 Registrar o app Web
- **Configurações do projeto** (ícone de engrenagem) → **Seus apps** → `</>` Web
- Dê um apelido e clique em **Registrar app**
- Copie as credenciais `firebaseConfig`

### 1.4 Configurar variáveis de ambiente
```bash
cp .env.example .env
```
Abra `.env` e preencha com os valores copiados do Console:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 1.5 Publicar regras de segurança
No Console do Firebase:
- **Firestore** → **Regras** → cole o conteúdo de `firestore.rules` → Publicar
- **Storage** → **Regras** → cole o conteúdo de `storage.rules` → Publicar

---

## 2. Rodar o app

```bash
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173)

---

## 3. Criar o usuário Admin (Cowboy)

### Opção A – Script de seed (recomendado + dados de exemplo)

1. Baixe a **chave de serviço** do Firebase:
   Console → Configurações → **Contas de serviço** → **Gerar nova chave privada**
2. Salve como `serviceAccountKey.json` na raiz do projeto
3. Instale o SDK admin: `npm install firebase-admin`
4. Rode o seed: `node scripts/seed.mjs`

   Isso cria:
   - `admin` / `cowboy2024` → role **admin** (🤠 Cowboy)
   - `jessica_lima`, `rafael_costa`, `marina_souza` / `senha123` → alunos (incluindo uma sem modelo criada, para testar o estado vazio)

### Opção B – Manual (sem seed)

1. Crie uma conta pelo site normalmente (ex: nome `admin`)
2. No Firestore Console → **usuarios** → encontre o documento
3. Altere o campo `role` de `"aluno"` para `"admin"`
4. Faça login → você verá o **Painel do Cowboy**

---

## 4. Estrutura de Arquivos

```
src/
├── pages/
│   ├── AuthPage.jsx       # Login + Cadastro
│   ├── FeedPage.jsx       # Feed principal (alunos)
│   └── AdminPage.jsx      # Painel do Cowboy
├── components/
│   ├── CowboyLogo.jsx     # Logo SVG inline
│   ├── ModelCard.jsx      # Card leitura (outros alunos)
│   ├── MyModelCard.jsx    # Card do próprio aluno (editar + ajuda)
│   ├── EmptyModelCard.jsx # CTA criar modelo
│   ├── EditModelModal.jsx # Modal edição + upload foto
│   ├── HelpModal.jsx      # Modal "Preciso de ajuda"
│   ├── BottomNav.jsx      # Navegação inferior
│   ├── CuriositiesTab.jsx # Aba curiosidades
│   ├── InspirationTab.jsx # Aba perfis para inspirar
│   └── ProfileTab.jsx     # Aba meu perfil
├── contexts/
│   └── AuthContext.jsx    # Auth provider
└── firebase/
    └── config.js          # Firebase init
```

---

## 5. Regras de Segurança

- **Aluno** edita apenas a própria modelo (`modelos/{seu_uid}`)
- **Admin** lê e edita tudo
- **Fotos**: cada aluno sobe apenas em `/modelos/{seu_uid}/` · máx. 5MB
- Pedidos de ajuda: criados pelo aluno, gerenciados pelo admin

---

## 6. Deploy (opcional)

```bash
npm run build
npx firebase-tools deploy --only hosting
```

---

## Avisos

- Nunca commite o `serviceAccountKey.json` — adicione ao `.gitignore`
- Altere a senha do admin após o primeiro login
- O arquivo `.env` também deve estar no `.gitignore`
