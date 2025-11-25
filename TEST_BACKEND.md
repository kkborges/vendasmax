# 🧪 Teste do Backend

## Passo 1: Verificar se Backend está Rodando

No terminal onde o backend está rodando, você deve ver:
```
✅ Conexão com PostgreSQL estabelecida
✅ Conexão com Redis estabelecida
🚀 Servidor rodando na porta 3001
```

Se não vê essas mensagens, o backend **NÃO ESTÁ** rodando corretamente.

## Passo 2: Testar Endpoints Manualmente

Execute cada comando abaixo em um **NOVO TERMINAL**:

### 1. Testar se servidor responde
```bash
curl http://localhost:3001/
```

**Esperado:** `{"message":"VendasMax API","version":"1.0.0","status":"running"}`

### 2. Testar Health Check
```bash
curl http://localhost:3001/api/health
```

**Esperado:** `{"status":"OK","timestamp":"...","uptime":...}`

### 3. Testar Login Condomínio (CRÍTICO)
```bash
curl -X POST http://localhost:3001/api/auth/login/condominio \
  -H "Content-Type: application/json" \
  -d '{"usuario":"condominio1","senha":"senha123"}'
```

**Esperado:** `{"token":"...","condominio":{...}}`

**Se receber erro 401 ou "Credenciais inválidas":**
→ O banco está vazio! Execute o seed:

```bash
cd /home/user/vendasmax/backend
npm run db:seed
```

### 4. Script Automático (Opcional)

Executar todos os testes de uma vez:

```bash
cd /home/user/vendasmax/backend
./test-api.sh
```

## Passo 3: Verificar CORS

O erro pode ser CORS bloqueando a requisição do navegador. Verifique o arquivo `.env` do backend:

```bash
cat /home/user/vendasmax/backend/.env | grep CORS
```

**Deve ter:**
```
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

**Se não tiver, adicione:**
```bash
echo "CORS_ORIGIN=http://localhost:5173,http://localhost:5174" >> /home/user/vendasmax/backend/.env
```

Depois **REINICIE** o backend (Ctrl+C e `npm run dev` novamente).

## Passo 4: Verificar Logs do Backend

Enquanto tenta fazer login no navegador, observe o terminal do backend. Deve aparecer:

```
info: POST /api/auth/login/condominio
```

**Se NÃO aparecer nada:**
→ A requisição nem está chegando ao backend (problema de rede/porta/CORS)

**Se aparecer erro:**
→ Copie a mensagem de erro e me envie

## Diagnóstico Rápido

Execute este comando e me envie o resultado:

```bash
cd /home/user/vendasmax/backend

echo "=== Status do Backend ==="
ps aux | grep "node.*3001" | grep -v grep

echo -e "\n=== Variáveis de Ambiente ==="
cat .env | grep -E "PORT|CORS|DATABASE_URL|JWT_SECRET"

echo -e "\n=== Teste Rápido ==="
curl -s http://localhost:3001/api/health

echo -e "\n=== Teste Login ==="
curl -s -X POST http://localhost:3001/api/auth/login/condominio \
  -H "Content-Type: application/json" \
  -d '{"usuario":"condominio1","senha":"senha123"}' | head -c 200

echo -e "\n"
```

Cole o resultado aqui para eu analisar!
