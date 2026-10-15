# 🚀 Guia Completo de Deploy - Simulador Consórcio

## 📋 O que você vai aprender:
1. Como subir o código para o GitHub
2. Como conectar o GitHub ao Vercel
3. Como configurar o Supabase (banco de dados)
4. Como fazer deploy automático

---

## 🎯 FASE 1: GitHub (Repositório do Código)

### O que é o GitHub?
É como um "Google Drive" para código. Armazena todas as versões do seu projeto e permite controle de mudanças.

### Passo 1: Criar arquivo .gitignore
```bash
# No terminal, dentro da pasta do projeto:
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### Passo 2: Inicializar o Git
```bash
git init
git add .
git commit -m "Primeiro commit - Simulador Consórcio"
```

### Passo 3: Criar repositório no GitHub
1. Acesse: https://github.com/new
2. Nome do repositório: `simulador-consorcio`
3. Marque como **Private** (privado)
4. **NÃO** marque "Add README" ou ".gitignore"
5. Clique em **Create repository**

### Passo 4: Conectar e enviar o código
```bash
# Substitua SEU_USUARIO pelo seu usuário do GitHub
git remote add origin https://github.com/SEU_USUARIO/simulador-consorcio.git
git branch -M main
git push -u origin main
```

✅ **Pronto! Seu código está no GitHub!**

---

## 🌐 FASE 2: Vercel (Hospedagem do Site)

### O que é o Vercel?
Pega seu código do GitHub e transforma em um site na internet. Faz deploy automático sempre que você atualiza o código.

### Passo 1: Criar conta no Vercel
1. Acesse: https://vercel.com/signup
2. Clique em **Continue with GitHub**
3. Autorize o Vercel a acessar seus repositórios

### Passo 2: Importar o projeto
1. Clique em **Add New Project**
2. Encontre `simulador-consorcio` na lista
3. Clique em **Import**

### Passo 3: Configurar o projeto
O Vercel detecta automaticamente que é um projeto Vite. Confirme:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Passo 4: Adicionar variáveis de ambiente
1. Clique em **Environment Variables**
2. Adicione as variáveis do arquivo `.env.example`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CONTACT_EMAIL`
   - `VITE_WHATSAPP`
   - `VITE_INSTAGRAM`

### Passo 5: Deploy!
1. Clique em **Deploy**
2. Aguarde ~2 minutos
3. Seu site estará em: `https://simulador-consorcio.vercel.app`

✅ **Pronto! Seu site está no ar!**

---

## 🗄️ FASE 3: Supabase (Banco de Dados)

### O que é o Supabase?
Banco de dados na nuvem. Armazena propostas, clientes, documentos, etc. É como um "Excel online" superpoderoso.

### Passo 1: Criar projeto no Supabase
1. Acesse: https://app.supabase.com
2. Clique em **New Project**
3. Preencha:
   - **Name:** `simulador-consorcio`
   - **Database Password:** (crie uma senha forte)
   - **Region:** South America (São Paulo)
4. Clique em **Create new project**
5. Aguarde ~2 minutos

### Passo 2: Pegar as credenciais
1. Vá em **Settings** (ícone de engrenagem) → **API**
2. Copie:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGciOi...`

### Passo 3: Adicionar credenciais no Vercel
1. Volte ao Vercel → Seu projeto → **Settings** → **Environment Variables**
2. Adicione:
   - `VITE_SUPABASE_URL` = Project URL
   -VITE_SUPABASE_ANON_KEY` = anon public key
3. Clique em **Save**

### Passo 4: Criar tabelas no Supabase
1. No Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Cole o SQL abaixo e clique em **Run**:

```sql
-- Tabela de propostas
CREATE TABLE proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  credit_value DECIMAL(10,2) NOT NULL,
  months INTEGER NOT NULL,
  first_installment DECIMAL(10,2) NOT NULL,
  other_installments DECIMAL(10,2) NOT NULL,
  consortium_type TEXT NOT NULL,
  tax_rate DECIMAL(5,2) NOT NULL,
  reserve_fund DECIMAL(5,2) NOT NULL,
  lance_type TEXT NOT NULL,
  lance_value DECIMAL(10,2),
  is_parcelinha BOOLEAN DEFAULT FALSE,
  post_contemplation_installment DECIMAL(10,2),
  proposal_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de aquisições (formulário do cliente)
CREATE TABLE acquisitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cpf TEXT NOT NULL,
  address TEXT,
  cnh_file_url TEXT,
  comprovante_file_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de arquivos
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  acquisition_id UUID REFERENCES acquisitions(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE acquisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permitir leitura e escrita pública por enquanto)
CREATE POLICY "Enable read access for all users" ON proposals FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON proposals FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON acquisitions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON acquisitions FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON files FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON files FOR INSERT WITH CHECK (true);
```

### Passo 5: Criar bucket de storage (para arquivos)
1. No Supabase, vá em **Storage**
2. Clique em **New bucket**
3. Nome: `documents`
4. Marque **Public bucket**
5. Clique em **Create bucket**

✅ **Pronto! Seu banco de dados está configurado!**

---

## 🔄 FASE 4: Atualizações Futuras

### Como atualizar o código:
```bash
# 1. Faça suas alterações no código

# 2. Adicione as mudanças
git add .

# 3. Faça commit
git commit -m "Descrição do que mudou"

# 4. Envie para o GitHub
git push

# 5. O Vercel faz deploy automaticamente! 🎉
```

### Como ver o histórico:
```bash
git log --oneline
```

### Como voltar para uma versão anterior:
```bash
git checkout NOME_DO_COMMIT
```

---

## 🎯 RESUMO DO FLUXO

```
1. Você edita o código localmente
   ↓
2. git add . → git commit → git push
   ↓
3. GitHub recebe o código atualizado
   ↓
4. Vercel detecta a mudança automaticamente
   ↓
5. Vercel faz build e deploy (~2 minutos)
   ↓
6. Site atualizado no ar! 🚀
```

---

## 📞 COMANDOS ÚTEIS

### Ver status do Git:
```bash
git status
```

### Ver o que mudou:
```bash
git diff
```

### Desfazer mudanças locais:
```bash
git checkout .
```

### Ver branches:
```bash
git branch -a
```

---

## 🔐 SEGURANÇA

### Nunca commite:
- ❌ Arquivos `.env` com senhas
- ❌ Pasta `node_modules`
- ❌ Pasta `dist` ou `build`

### Sempre commite:
- ✅ Código fonte (pasta `src`)
- ✅ Arquivos de configuração (`package.json`, `vite.config.js`)
- ✅ Documentação (`README.md`)

---

## 🐛 PROBLEMAS COMUNS

### "Permission denied" no Git:
```bash
# Configure seu usuário
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### Vercel não faz deploy:
1. Verifique se o repositório está conectado
2. Confira as variáveis de ambiente
3. Veja os logs de build no Vercel

### Supabase não conecta:
1. Verifique se as URLs estão corretas
2. Confirme se as variáveis de ambiente foram adicionadas no Vercel
3. Faça novo deploy no Vercel após adicionar as variáveis

---

## 📚 PRÓXIMOS PASSOS

Depois que tudo estiver funcionando:

1. **Integrar o código com Supabase** (substituir FormSubmit por Supabase)
2. **Criar painel admin** para ver propostas salvas
3. **Adicionar autenticação** para vendedores
4. **Configurar domínio personalizado** (opcional)

---

## 💡 DICAS

- **Faça commits pequenos e frequentes** (facilita encontrar erros)
- **Use mensagens descritivas** nos commits
- **Teste localmente antes de fazer push**
- **Mantenha o README.md atualizado**

---

**Precisa de ajuda?** Me avise em qual passo você está e o que está dando errado! 🚀
