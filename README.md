# Painel de gerenciamento de produtos

Aplicação React desenvolvida para um teste técnico de front-end pleno. O painel
consome uma API REST fornecida pelo `json-server` e permite listar, pesquisar,
filtrar, visualizar, cadastrar, editar e excluir produtos.

O projeto prioriza TypeScript rigoroso, separação de responsabilidades,
acessibilidade básica, estados de interface claros e código que possa ser
explicado e mantido com facilidade.

## Funcionalidades

- Listagem paginada no servidor, com total de registros;
- Busca por nome com debounce de 350 ms;
- Filtro por categoria;
- Busca, categoria e página sincronizadas com a URL;
- Estados de carregamento inicial, atualização, erro e resultados vazios;
- Detalhes completos do produto;
- Cadastro e edição com formulário reutilizável;
- Validação dos campos com mensagens próximas aos controles;
- Exclusão com confirmação acessível;
- Feedback de sucesso e erro nas operações;
- Preservação dos filtros ao navegar entre listagem e detalhes;
- Layout responsivo com tabela rolável em telas menores;
- Página para rotas não encontradas.

## Tecnologias

- React 19;
- TypeScript em modo `strict`;
- Vite;
- React Router;
- TanStack Query;
- Axios;
- React Hook Form;
- Zod e `@hookform/resolvers`;
- Vitest;
- React Testing Library e `user-event`;
- JSON Server 0.17.4;
- CSS puro.

## Pré-requisitos

- Node.js `20.19.0` ou superior, ou `22.12.0` ou superior;
- npm, utilizado pelo projeto por meio do `package-lock.json`.

As versões mínimas do Node seguem os requisitos do Vite instalado.

## Instalação

Na pasta do projeto, execute:

```bash
npm ci
```

O uso de `npm ci` garante uma instalação reproduzível a partir do lockfile.

## Variáveis de ambiente

A URL da API pode ser configurada pela variável:

```env
VITE_API_BASE_URL=http://localhost:3001
```

O arquivo [.env.example](./.env.example) contém o valor esperado. Sem um
arquivo `.env`, a aplicação usa `http://localhost:3001` como padrão.

Para criar uma configuração local em sistemas Unix:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

## Como executar

São necessários dois terminais abertos na raiz do projeto.

Terminal 1 — iniciar a API fake:

```bash
npm run api
```

A API ficará disponível em `http://localhost:3001`, usando o recurso
`/produtos` e persistindo as operações no arquivo `db.json`.

Terminal 2 — iniciar o front-end:

```bash
npm run dev
```

Abra no navegador o endereço informado pelo Vite, normalmente
`http://localhost:5173`.

## Rotas

| Rota | Tela |
| --- | --- |
| `/` | Redirecionamento para produtos |
| `/products` | Listagem de produtos |
| `/products/new` | Cadastro de produto |
| `/products/:productId` | Detalhes do produto |
| `/products/:productId/edit` | Edição do produto |
| `*` | Página não encontrada |

## Scripts disponíveis

```bash
npm run dev        # inicia o front-end em desenvolvimento
npm run api        # inicia o JSON Server na porta 3001
npm run test       # executa os testes uma vez
npm run test:watch # executa os testes em modo interativo
npm run lint       # analisa o código com ESLint
npm run typecheck  # valida os tipos sem gerar arquivos
npm run build      # valida os tipos e gera o build de produção
npm run preview    # serve localmente o build gerado
```

## Estrutura de pastas

```text
src/
  app/                  # providers, QueryClient, layout e rotas
  features/
    products/
      api/              # serviço HTTP, erros, schemas e React Query
      components/       # formulário, tabela, filtros e estados visuais
      constants/        # categorias conhecidas
      hooks/            # debounce e filtros sincronizados com a URL
      mappers/          # conversão entre DTO e modelo de domínio
      pages/            # páginas da feature
      schemas/          # validação do formulário
      styles/           # estilos específicos de produtos
      types/            # tipos da API e do domínio
      utils/            # utilitários da feature
  shared/               # componentes, hooks, estilos e utilitários comuns
  test/                 # configuração e helper de renderização dos testes
```

Os componentes de página coordenam consultas, mutations e navegação. A
apresentação e as interações locais ficam em componentes menores. Nenhuma
chamada HTTP é realizada diretamente pelas páginas.

## Decisões técnicas

### Modelo interno e contrato da API

A API utiliza campos em português, como `nome`, `preco` e `estoque`. A camada
visual trabalha com um modelo em inglês, e mappers explícitos fazem a conversão
nos dois sentidos. Schemas Zod também validam as respostas antes que elas
cheguem à interface.

### Categorias

As categorias são mantidas em uma constante tipada porque a API disponibilizada
não possui um recurso de categorias. Os valores correspondem exatamente aos
existentes no `db.json`; os rótulos apresentados ao usuário recebem a acentuação
adequada.

### Paginação

A paginação é executada pela API com `_page` e `_limit`. A aplicação lê o header
`X-Total-Count` para calcular o total de páginas. Os produtos não são carregados
integralmente para depois serem recortados no navegador.

Se uma exclusão remover o último item da página atual, a interface retorna para
a página anterior. Páginas que deixarem de existir também são normalizadas após
a resposta do servidor.

### Busca e debounce

O campo de busca é controlado pela URL, que permanece como fonte única do
estado. A digitação atualiza o parâmetro `search`, mas a consulta à API só é
liberada 350 ms depois da última alteração. Isso evita uma chamada por tecla sem
criar um segundo estado de filtro independente.

### Estado na URL

Os parâmetros `page`, `search` e `category` são lidos com `URLSearchParams` por
meio do React Router. Valores inválidos são removidos, e alterar busca ou
categoria retorna à primeira página. Refresh, voltar e avançar do navegador
restauram o estado representado na URL.

A navegação para detalhes, criação e edição também guarda a URL da listagem para
que o usuário retorne aos mesmos filtros.

### Cache e atualização de dados

O TanStack Query centraliza cache, estados assíncronos e cancelamento das
consultas. As query keys incluem página, tamanho, busca e categoria. Depois de
criar, editar ou excluir, somente as consultas relacionadas aos produtos são
atualizadas. Respostas `404` de detalhes não são repetidas.

### Formulário

`ProductForm` é compartilhado entre cadastro e edição. React Hook Form controla
os campos e o Zod valida nome, categoria, preço, estoque e status. Campos e ações
são bloqueados durante o envio, com uma trava adicional contra submissões
simultâneas.

### Tratamento de erros

A camada HTTP converte falhas de rede, respostas HTTP inválidas e formatos
inesperados em `ApiError`. A listagem e as páginas de produto mostram mensagens
compreensíveis e oferecem nova tentativa quando a falha pode ser recuperada.
Erros de mutations permanecem próximos da ação que falhou.

### Acessibilidade e responsividade

- Estrutura com `header`, navegação, `main` e skip link;
- Labels associados a inputs e erros ligados por `aria-describedby`;
- Feedback assíncrono com `role="status"` ou `role="alert"`;
- Diálogo com nome e descrição acessíveis, `aria-modal`, foco contido, Escape e
  restauração do foco;
- Estados de foco, hover e disabled visíveis;
- Respeito a `prefers-reduced-motion`;
- Formulários e detalhes reorganizados em telas menores;
- Scroll horizontal restrito ao contêiner da tabela.

### Carregamento por rota

As páginas de cadastro, edição e detalhes são carregadas sob demanda. Isso reduz
o JavaScript inicial sem alterar a organização da feature.

## Testes implementados

A suíte usa Vitest, React Testing Library, `user-event` e mocks determinísticos.
Ela não depende de uma instância real do JSON Server.

Há cobertura para:

- Validação, submissão válida, erro da API e submissão simultânea do formulário;
- Debounce antes e depois do intervalo configurado;
- Leitura, alteração e normalização dos filtros na URL;
- Loading, erro, atualização e resultados vazios da listagem;
- Paginação e seus estados desabilitados;
- Mappers e montagem dos parâmetros da API;
- Respostas inválidas, erros HTTP e `DELETE` sem corpo;
- Cache e invalidação após criar, editar e excluir;
- Criação, edição, detalhes, produto inexistente e ID inválido;
- Exclusão do último produto da página;
- Confirmação, cancelamento, Escape e gerenciamento de foco do diálogo;
- Sanitização do estado de retorno entre rotas.

Execute a suíte com:

```bash
npm run test
```

## Limitações conhecidas

- As categorias dependem de uma constante local; novas categorias adicionadas à
  API exigem atualização dessa constante;
- O JSON Server é uma API fake e não reproduz autenticação, concorrência,
  validações ou regras de negócio de um back-end real;
- O JSON Server persiste operações manuais diretamente no `db.json`;
- A suíte automatizada é de unidade e integração de componentes. Os fluxos no
  navegador foram validados manualmente, mas não há uma suíte E2E permanente;
- A aplicação está em português do Brasil e não possui internacionalização.

## Melhorias com mais tempo

- Adicionar testes E2E com Playwright para os principais fluxos;
- Automatizar auditorias de acessibilidade com axe-core;
- Obter categorias de um endpoint quando a API oferecer esse recurso;
- Adicionar observabilidade e registro estruturado de falhas em um ambiente
  real;
- Avaliar atualizações otimistas se a latência do back-end justificar a
  complexidade.

## Validação do projeto

Antes da entrega, execute:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Esses comandos verificam estilo, tipagem, comportamento e geração do bundle de
produção.
