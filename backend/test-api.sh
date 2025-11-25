#!/bin/bash

echo "🧪 Testando Backend VendasMax"
echo "================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4

    echo -e "${YELLOW}Testando:${NC} $description"
    echo "  Endpoint: $method $url"

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$url" -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$url" -H "Content-Type: application/json" -d "$data")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "  ${GREEN}✓ Status: $http_code${NC}"
        echo "  Response: $body" | jq '.' 2>/dev/null || echo "  Response: $body"
    else
        echo -e "  ${RED}✗ Status: $http_code${NC}"
        echo "  Response: $body"
    fi
    echo ""
}

# Testar se servidor está rodando
echo "1. Verificando se servidor está rodando..."
test_endpoint "GET" "http://localhost:3001/" "" "Root endpoint"

# Testar health check
echo "2. Testando health check..."
test_endpoint "GET" "http://localhost:3001/api/health" "" "Health check"

# Testar login admin
echo "3. Testando login admin..."
test_endpoint "POST" "http://localhost:3001/api/auth/login/admin" \
    '{"email":"admin@vendasmax.com","senha":"admin123"}' \
    "Login Admin"

# Testar login condomínio
echo "4. Testando login condomínio..."
test_endpoint "POST" "http://localhost:3001/api/auth/login/condominio" \
    '{"usuario":"condominio1","senha":"senha123"}' \
    "Login Condomínio"

# Testar CORS
echo "5. Testando CORS..."
curl -s -I -X OPTIONS "http://localhost:3001/api/health" \
    -H "Origin: http://localhost:5174" \
    -H "Access-Control-Request-Method: POST" | grep -i "access-control"

echo ""
echo "================================"
echo "Testes concluídos!"
