# Scripts de Inicialização

Este diretório contém scripts para inicialização e configuração do sistema.

## Scripts Disponíveis

### setup.ts
Este é o script principal que configura todo o sistema de uma vez. É recomendado para novos ambientes.

O script realiza as seguintes tarefas:
1. Cria o diretório de armazenamento de arquivos
2. Inicializa a propriedade padrão
3. Cria as categorias de documentos padrão
4. Cria o usuário administrador
5. Configura a estrutura de pastas para documentos

**Como executar:**
```bash
# Método 1: Usando npx ts-node
npx ts-node src/scripts/setup.ts

# Método 2: Usando o script npm
npm run setup
```

**Parâmetros de ambiente:**
Você pode personalizar o comportamento do script através de variáveis de ambiente:

- `MONGODB_URI`: URI de conexão com o MongoDB (padrão: `mongodb://localhost:27017/defesa-admin`)
- `STORAGE_PATH`: Caminho para armazenamento de arquivos (padrão: `./uploads`)
- `PROPERTY_NAME`: Nome da propriedade (padrão: `Fazenda Brilhante`)
- `ADMIN_EMAIL`: Email do usuário administrador (padrão: `admin@defesa.com`)
- `ADMIN_PASSWORD`: Senha do usuário administrador (padrão: `admin123`)
- `ADMIN_NAME`: Nome do usuário administrador (padrão: `Administrador`)

### init-property.ts
Este script inicializa uma propriedade padrão para o sistema.

**Como executar:**
```bash
# Método 1: Usando npx ts-node
npx ts-node src/scripts/init-property.ts

# Método 2: Usando o script npm (se configurado no package.json)
npm run init-property
```

**Parâmetros de ambiente:**
Você pode personalizar o comportamento do script através de variáveis de ambiente:

- `MONGODB_URI`: URI de conexão com o MongoDB (padrão: `mongodb://localhost:27017/defesa-admin`)
- `PROPERTY_NAME`: Nome da propriedade (padrão: `Fazenda Brilhante`)
- `PROPERTY_DESCRIPTION`: Descrição da propriedade (padrão: `Propriedade principal do sistema`)

**Exemplo com variáveis de ambiente:**
```bash
MONGODB_URI=mongodb://custom-host:27017/custom-db PROPERTY_NAME="Minha Propriedade" npx ts-node src/scripts/init-property.ts
```

### init-admin.ts
Este script inicializa um usuário administrador padrão para o sistema.

**Importante:** Execute o script `init-property.ts` primeiro para criar a propriedade que será associada ao administrador.

**Como executar:**
```bash
# Método 1: Usando npx ts-node
npx ts-node src/scripts/init-admin.ts

# Método 2: Usando o script npm (se configurado no package.json)
npm run init-admin
```

**Parâmetros de ambiente:**
Você pode personalizar o comportamento do script através de variáveis de ambiente:

- `MONGODB_URI`: URI de conexão com o MongoDB (padrão: `mongodb://localhost:27017/defesa-admin`)
- `ADMIN_EMAIL`: Email do usuário administrador (padrão: `admin@defesa.com`)
- `ADMIN_PASSWORD`: Senha do usuário administrador (padrão: `admin123`)
- `ADMIN_NAME`: Nome do usuário administrador (padrão: `Administrador`)
- `PROPERTY_SLUG`: Slug da propriedade a ser associada ao admin (padrão: `fazenda-brilhante`)

**Exemplo com variáveis de ambiente:**
```bash
MONGODB_URI=mongodb://custom-host:27017/custom-db ADMIN_EMAIL=custom@example.com ADMIN_PASSWORD=securepw123 npx ts-node src/scripts/init-admin.ts
```

## Configuração Completa do Sistema

Para uma configuração completa do sistema, recomendamos usar o script unificado `setup.ts`:

```bash
# Configurar ambiente e inicializar tudo com um único comando
npm run setup
```

Alternativamente, se preferir executar os scripts individualmente, siga esta sequência:

```bash
# 1. Configure o ambiente
npm run dev:setup

# 2. Inicialize a propriedade padrão
npm run init-property

# 3. Inicialize o usuário administrador
npm run init-admin
```

## Nota de Segurança
Os scripts de inicialização devem ser executados apenas durante a configuração do sistema ou em ambientes de desenvolvimento.
Para ambientes de produção, altere as senhas padrão imediatamente após a instalação. 