#!/bin/bash

# Teste de CORS para a API DefesaAdmin
echo "====== Teste de CORS para a API DefesaAdmin ======"
echo "Este script testa se a configuração CORS está correta"
echo ""

# Define as origens que desejamos testar
ORIGINS=(
  "http://localhost:3000"
  "https://valeverde.defesa.vercel.app"
  "https://valeverdedefesa.vercel.app"
)

# Define o endpoint da API
API_URL=${1:-"http://localhost:4000"}

echo "Usando API URL: $API_URL"
echo ""

for origin in "${ORIGINS[@]}"; do
  echo "=== Testando origem: $origin ==="
  
  # Testa um pedido OPTIONS (preflight)
  echo "Testando preflight request (OPTIONS):"
  curl -s -I -X OPTIONS \
    -H "Origin: $origin" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type, Authorization" \
    "$API_URL/api/documents" | grep -i "access-control"
  
  echo ""
  
  # Testa um pedido GET normal
  echo "Testando GET request:"
  curl -s -I -X GET \
    -H "Origin: $origin" \
    "$API_URL/api/documents" | grep -i "access-control"
  
  echo "=============================="
  echo ""
done

echo "Teste concluído!"