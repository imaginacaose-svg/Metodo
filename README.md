# Simulador Consórcio

Sistema completo de simulação de consórcios com geração de propostas personalizadas.

## 🚀 Funcionalidades

- ✅ **3 abas no painel admin**
  - Proposta: Dados do cliente, valores, modalidade, lance
  - Taxa Administrativa: Simulador de 15% a 22%
  - Lance Total: Simulador de lance embutido + livre

- ✅ **Página de proposta para o cliente**
  - Banner de urgência (24h)
  - Cartão de crédito com dados principais
  - Composição do valor total
  - Condições de pagamento (1ª parcela, demais, pós-contemplação)
  - Resumo do lance (embutido, livre, total)
  - Comparativo consórcio vs financiamento
  - Formulário de aquisição com envio de documentos

- ✅ **Cálculos financeiros**
  - Financiamento: 2,5% a.m. (30% a.a.) - Tabela Price
  - Prazo máximo: 60 parcelas
  - Valor financiado = valor líquido da carta
  - Taxas sobre valor contratado

- ✅ **Modalidade Parcelinha**
  - Parcela reduzida até contemplação
  - Parcela normal após contemplação

- ✅ **Lances**
  - Lance embutido: 25% do crédito
  - Lance livre: valor adicional do bolso
  - Total de lance = embutido + livre
  - Valor líquido = crédito - embutido

- ✅ **Integrações**
  - Envio de documentos por email (FormSubmit)
  - WhatsApp: +55 79 98138-6285
  - Instagram: @metodo.consorcio

## 🛠️ Tecnologias

- **React 18** com TypeScript
- **Vite** para build
- **Tailwind CSS** para estilização
- **React Router** para rotas
- **Lucide React** para ícones

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🌐 Deploy

### Vercel

1. Conecte o repositório ao Vercel
2. O Vercel detecta automaticamente o Vite
3. Deploy automático a cada push

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
VITE_CONTACT_EMAIL=thiagoinfotech@gmail.com
VITE_WHATSAPP=5579981386285
VITE_INSTAGRAM=metodo.consorcio
```

## 📊 Estrutura do Projeto

```
src/
├── pages/
│   ├── AdminPage.tsx      # Painel admin (3 abas)
│   └── ProposalPage.tsx   # Página da proposta
├── utils/
│   ├── format.ts          # Funções de formatação
│   └── financing.ts       # Cálculos de financiamento
├── App.tsx                # Rotas principais
├── main.tsx               # Entry point
└── index.css              # Estilos globais
```

## 🎯 Como Usar

### Para Vendedores

1. Acesse a página inicial (`/`)
2. Preencha os dados do cliente e valores
3. Escolha o tipo de consórcio (imobiliário/automóvel)
4. Configure taxa administrativa e lance
5. Gere o link da proposta
6. Envie o link para o cliente

### Para Clientes

1. Acesse o link recebido
2. Visualize a proposta personalizada
3. Confira todos os cálculos e comparativos
4. Preencha o formulário de aquisição
5. Anexe os documentos (CNH, comprovante)
6. Envie para o consultor

## 📱 Contato

- **WhatsApp:** +55 79 98138-6285
- **Instagram:** @metodo.consorcio
- **Email:** thiagoinfotech@gmail.com

## 📄 Licença

© 2025 Simulador Consórcio. Todos os direitos reservados.
