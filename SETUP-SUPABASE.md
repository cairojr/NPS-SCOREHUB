# Configuração Supabase - ScoreHUB

## 🚀 Passo a Passo para Produção

### **1. Criar Projeto Supabase**
1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login/cadastro
4. Clique em "New Project"
5. Escolha sua organização
6. Preencha:
   - **Name**: `scorehub-donadel-guimaraes`
   - **Database Password**: Senha segura (anote!)
   - **Region**: `South America (São Paulo)`
7. Clique em "Create new project"
8. Aguarde 2-3 minutos para provisionar

### **2. Configurar Banco de Dados**
1. No painel Supabase, vá em **SQL Editor**
2. Clique em "+ New query"
3. Copie TODO o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor SQL
5. Clique em "RUN" para executar
6. Aguarde completar - deve aparecer "Success"

### **3. Obter Credenciais**
1. Vá em **Settings** > **API**
2. Copie:
   - **Project URL** (URL do projeto)
   - **anon public** (chave pública)

### **4. Configurar .env**
1. Abra o arquivo `.env` no VS Code
2. Substitua pelos valores reais:
```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

### **5. Criar Primeiro Usuário Admin**
1. No Supabase, vá em **Authentication** > **Users**
2. Clique em "Add user"
3. Preencha:
   - **Email**: `hubcentrodeinovacao@gmail.com`
   - **Password**: `Soudecristo`
   - **Email Confirm**: ✅ Marcado
4. Clique em "Create user"

### **6. Testar Conexão**
1. Reinicie o servidor: `npm run dev`
2. Acesse http://localhost:8081
3. Faça login com as credenciais
4. Crie uma avaliação de teste
5. Verifique no Supabase:
   - **Table Editor** > **evaluations**
   - Deve aparecer a avaliação criada

## ⚠️ IMPORTANTE
- Sem estes passos, o sistema usa localStorage (não é produção)
- Com Supabase configurado, dados vão para o banco PostgreSQL
- RLS (Row Level Security) está ativo para segurança
- Backup automático e escalabilidade incluídos

## 🎯 Após Configuração
- ✅ Dados salvos no PostgreSQL
- ✅ Autenticação real
- ✅ Pronto para produção
- ✅ Multi-usuário
- ✅ Relatórios em tempo real
- ✅ Backup automático