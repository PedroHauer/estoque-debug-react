# Relatório de Depuração — Estoque Fácil

**Aluno:** Henrique Celso da Silveira
**Projeto:** estoque-debug-react (React + Vite + React Router + JSON Server)

## Resumo

| # | Falha | Categoria | Arquivo |
|---|---|---|---|
| 1 | Plugin do React registrado sem ser executado | Configuração | `vite.config.js` |
| 2 | Listagem chamava uma rota inexistente | Requisições HTTP / integração com API | `src/services/productService.js` |
| 3 | Exclusão chamada sem o `id` do produto | Parâmetros e argumentos de funções | `src/pages/ProductList.jsx` |
| 4 | Formulário não reagia à troca de rota | Hooks do React / estados e formulários controlados | `src/pages/ProductForm.jsx` |
| 5 | Ausência de validação dos dados | Validação de dados | `src/pages/ProductForm.jsx` |
| 6 | `id` enviado como texto na edição | Parâmetros e argumentos de funções | `src/services/productService.js` |
| 7 | Falha de conexão gerava mensagem técnica em inglês | Tratamento de exceções | `src/services/productService.js` |

> Os prints ficam na pasta `evidencias/`.

---

## Falha 1 — Plugin do React no Vite

| Campo | Descrição |
|---|---|
| **Arquivo/local** | `vite.config.js`, linha 5 |
| **Sintoma** | O `npm run dev` subia, mas a página em `localhost:5173` ficava totalmente em branco (`evidencias/01-antes-react-not-defined.png`). |
| **Causa** | O plugin estava escrito como `plugins: [react]`. `react` é uma função que **cria** o plugin; sem os parênteses, a função é passada, mas nunca é executada, e o plugin do React não é configurado. |
| **Diagnóstico** | No Console do navegador apareceu `Uncaught ReferenceError: React is not defined` em `App.jsx:7` (`evidencias/01-antes-react-not-defined.png`). Sem o plugin, o JSX não é transformado no formato automático e passa a exigir `React` importado em cada arquivo. Por isso fui ao `vite.config.js` e encontrei `react` sem parênteses. |
| **Correção** | Trocado para `plugins: [react()]`. |
| **Validação** | Após reiniciar o `npm run dev`, a aplicação abriu normalmente e o Console não mostrou mais o erro, só avisos do React Router (`evidencias/Captura de tela 2026-11-19 213158.png`). O `vite build` também conclui sem erros. |

---

## Falha 2 — Listagem não carregava os produtos (GET)

| Campo | Descrição |
|---|---|
| **Arquivo/local** | `src/services/productService.js`, função `getProducts` |
| **Sintoma** | A tela de listagem mostrava "Não foi possível carregar os produtos." e nenhum produto aparecia. |
| **Causa** | A requisição era feita para `http://localhost:3001/product` (singular), mas o JSON Server cria a rota a partir da chave do `db.json`, que é `products` (plural). A API respondia **404**. |
| **Diagnóstico** | Abri as duas URLs direto no navegador: `http://localhost:3001/product` retornou vazio (`{}`) (`evidencias/Captura de tela 2026-11-19 213411.png`), e `http://localhost:3001/products` retornou os 4 produtos. Comparando com o `productService.js`, vi que `getProducts` usava `/product`. |
| **Correção** | URL corrigida para `${API_URL}/products`. |
| **Validação** | A listagem passou a mostrar os 4 produtos, e a aba Network mostra `GET http://localhost:3001/products` com sucesso (`evidencias/Captura de tela 2026-11-19 213158.png`). No print o status é `304 Not Modified`, que é a resposta de sucesso usando o cache do navegador; sem cache, o status é 200. |

**Evidências:** `evidencias/Captura de tela 2026-11-19 213411.png` (antes: `/product` vazio), `evidencias/Captura de tela 2026-11-19 213158.png` (depois: listagem e Network)

---

## Falha 3 — Exclusão não removia o produto (DELETE)

| Campo | Descrição |
|---|---|
| **Arquivo/local** | `src/pages/ProductList.jsx`, função `handleDelete` |
| **Sintoma** | Ao confirmar a exclusão, aparecia "Não foi possível excluir o produto." e o produto continuava no `db.json`. |
| **Causa** | A função `deleteProduct` era chamada **sem argumento**: `deleteProduct()`. Assim o `id` chegava como `undefined` e a URL ficava `/products/undefined`, que não existe (404). |
| **Diagnóstico** | Encontrado na leitura do `handleDelete`: `deleteProduct()` era chamada sem argumento, mesmo recebendo o `id`. Testando direto na API, `DELETE /products/undefined` retorna 404. |
| **Correção** | Passado o `id` recebido pela função: `deleteProduct(id)`. |
| **Validação** | Teste do serviço contra o JSON Server: `DELETE /products/:id` com um `id` existente retornou 200 e o produto saiu do `db.json`; com `undefined`, retornou 404 e a mensagem "Não foi possível excluir o produto.". O `window.confirm` continua antes da chamada, então cancelar não exclui nada. |

**Evidências:** não há print da exclusão; a validação foi feita pelo teste descrito acima.

---

## Falha 4 — Formulário mantinha dados ao trocar de tela

| Campo | Descrição |
|---|---|
| **Arquivo/local** | `src/pages/ProductForm.jsx`, `useEffect` que carrega o produto |
| **Sintoma** | Estando na tela "Editar produto", ao clicar em "Cadastrar produto" no menu, o formulário de cadastro continuava preenchido com os dados do produto que estava sendo editado. |
| **Causa** | As rotas `/products/new` e `/products/:id/edit` usam o mesmo componente, então o React **reaproveita** o componente e o estado `form` não é zerado. Além disso, o `useEffect` tinha o array de dependências vazio (`[]`), então só rodava na primeira montagem e não reagia à mudança do `id`. |
| **Diagnóstico** | No `App.jsx`, as rotas `/products/new` e `/products/:id/edit` usam o mesmo `<ProductForm />`. No `ProductForm.jsx`, o `useEffect` tinha `[]` como dependências e retornava cedo quando não estava editando, então nada zerava o `form`. |
| **Correção** | `useEffect` passou a depender de `[id, isEditing]`. Quando não está editando, o formulário volta para `initialForm` e o erro é limpo; ao editar, `loading` volta a `true` e o produto é buscado de novo. Foi incluída uma flag `ignore` no cleanup para descartar respostas de requisições antigas. |
| **Validação** | Com o efeito dependendo de `[id, isEditing]`, trocar de "Editar" para "Cadastrar produto" mostra o formulário vazio, e abrir "Editar" de outro produto carrega os dados dele. O fluxo de edição funcionando aparece nos prints `evidencias/Captura de tela 2026-11-19 213804.png` e `evidencias/Captura de tela 2026-11-19 213955.png`. |

---

## Falha 5 — Validações não impediam dados inválidos

| Campo | Descrição |
|---|---|
| **Arquivo/local** | `src/pages/ProductForm.jsx`, função `handleSubmit` |
| **Sintoma** | Era possível cadastrar produto com nome e categoria vazios; preço e quantidade vazios eram salvos como `0`. |
| **Causa** | Não havia nenhuma validação antes de enviar. `Number('')` resulta em `0`, então campos vazios viravam números válidos. |
| **Diagnóstico** | Encontrado na leitura do `handleSubmit`: o objeto era montado e enviado direto, sem nenhuma checagem. Como `Number('')` é `0`, preço e quantidade vazios viravam `0`. |
| **Correção** | Criada a função `validate()`, chamada no `handleSubmit` antes do envio. Ela exige nome e categoria preenchidos (com `trim`), preço numérico ≥ 0 e quantidade inteira ≥ 0, e mostra uma mensagem específica para cada caso. Se houver erro, nenhuma requisição é feita. Nome e categoria são enviados sem espaços nas pontas. |
| **Validação** | A função `validate()` foi testada isoladamente. Nome vazio, categoria só com espaço, preço vazio, preço `-1`, quantidade vazia e quantidade `1.5` retornam, cada um, a sua mensagem de erro; dados válidos (`"10.5"`, `"3"`) não retornam erro. Quando há erro, o `handleSubmit` dá `return` antes de chamar a API, então nenhuma requisição é feita. |

---

## Falha 6 — `id` enviado como texto na edição (PUT)

| Campo | Descrição |
|---|---|
| **Arquivo/local** | `src/services/productService.js`, função `updateProduct` |
| **Sintoma** | Sem erro visível na tela. Encontrado na leitura do código: o corpo do PUT levava `"id": "1"` (texto) no lugar do `id` numérico do `db.json`. |
| **Causa** | O `id` vem da URL pelo `useParams`, e todo parâmetro de URL é **string**. Ele era enviado no corpo da requisição, substituindo o `id` numérico. |
| **Diagnóstico** | Segui o caminho do `id`: `useParams()` → `updateProduct(id, product)` → `JSON.stringify({ ...product, id })`. Como parâmetro de URL é sempre string, o `id` ia como texto no corpo. |
| **Correção** | Em `updateProduct`, o corpo passou a enviar `id: Number(id)`. |
| **Validação** | Teste do serviço com `updateProduct('1', ...)`: a resposta do `PUT /products/1` veio com `"id": 1` (número). Na aplicação, o produto "violao" foi editado de R$ 500,00 (`evidencias/Captura de tela 2026-11-19 213804.png`) para R$ 400,00 (`evidencias/Captura de tela 2026-11-19 213955.png`), e no `db.json` ele ficou com `"price": 400` e `"id": 5` numérico. |

---

## Falha 7 — Erro de conexão com mensagem incompreensível

| Campo | Descrição |
|---|---|
| **Arquivo/local** | `src/services/productService.js`, todas as funções |
| **Sintoma** | Com o JSON Server desligado, a tela mostrava "Failed to fetch" (mensagem técnica em inglês). |
| **Causa** | Quando não há conexão, o `fetch` lança um `TypeError` antes de existir `response`. Por isso a checagem `response.ok` nunca rodava, e a mensagem original do navegador chegava direto à tela. Isso descumpre a regra 6 (mensagens compreensíveis). |
| **Diagnóstico** | Na leitura do serviço, vi que só existia o tratamento de `!response.ok`. Quando a conexão falha, o `fetch` lança a exceção antes, e a mensagem que chega à tela é a do navegador. |
| **Correção** | Criada a função auxiliar `request()`, que envolve o `fetch` em `try/catch`. Em falha de rede, ela lança "Não foi possível conectar à API. Verifique se o JSON Server está em execução (npm run server)."; em status HTTP de erro, lança a mensagem específica de cada operação. |
| **Validação** | Chamando `getProducts()` com a API fora do ar (porta sem servidor), a mensagem retornada foi "Não foi possível conectar à API. Verifique se o JSON Server está em execução (npm run server).". |

---

## Critérios de aceite

- [ ] Listagem carrega os produtos da API.
- [ ] Cadastro persiste um novo produto no `db.json`.
- [ ] Edição persiste as alterações do produto correto.
- [ ] Exclusão remove o produto correto.
- [ ] Formulário apresenta dados ao editar.
- [ ] Validações impedem dados inválidos.
- [ ] Rotas de listagem, cadastro e edição funcionam ao atualizar o navegador.

## Evidências finais

| Print | O que mostra |
|---|---|
| `evidencias/01-antes-react-not-defined.png` | Antes: página em branco e `React is not defined` no Console (Falha 1). |
| `evidencias/Captura de tela 2026-11-19 213411.png` | Antes: `localhost:3001/product` retornando vazio (Falha 2). |
| `evidencias/Captura de tela 2026-11-19 213158.png` | Depois: listagem com os 4 produtos; aba Network com `GET /products` (304 Not Modified, sucesso via cache). |
| `evidencias/Captura de tela 2026-11-19 213804.png` | Depois: produto "violao" cadastrado (POST) aparecendo na listagem; 5 produtos; aba Network com várias requisições `products`. |
| `evidencias/Captura de tela 2026-11-19 213955.png` | Depois: o mesmo produto editado (PUT) de R$ 500,00 para R$ 400,00. |

Não há print da aba Network com `POST`, `PUT` ou `DELETE` específicos. Esses métodos foram testados chamando o serviço contra o JSON Server: `POST` 201, `PUT` 200, `DELETE` 200.

## Reflexão

✏️ Qual erro foi mais difícil de encontrar e por quê? (escreva com as suas palavras)
