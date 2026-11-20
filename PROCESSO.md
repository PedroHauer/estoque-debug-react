# Registro do processo — continuação do trabalho

Anotações para continuar o desafio em outro computador. O relatório oficial de entrega é o `RELATORIO.md`.

## Como retomar em casa

```bash
git clone https://github.com/PedroHauer/estoque-debug-react.git
cd estoque-debug-react
npm install
```

Abra dois terminais:

```bash
npm run server   # API em http://localhost:3001
npm run dev      # app em http://localhost:5173
```

## Histórico

| Commit | O que foi feito |
|---|---|
| `5d2f5ff` | Projeto original recebido, com as falhas. |
| `df82c46` | Correção das 7 falhas, `RELATORIO.md` preenchido (menos a Reflexão) e prints em `evidencias/`. |

## Etapas já concluídas

1. **Investigação inicial:** a página abriu em branco e o Console mostrou `React is not defined` em `App.jsx:7` (print `01-antes-react-not-defined.png`).
2. **Correções no código:**
   - `vite.config.js`: `plugins: [react]` → `plugins: [react()]`.
   - `src/services/productService.js`:
     - o GET agora usa `/products` em vez de `/product`;
     - o PUT envia `id: Number(id)`;
     - nova função `request()`, que mostra uma mensagem clara quando a API está desligada.
   - `src/pages/ProductList.jsx`: `deleteProduct()` → `deleteProduct(id)`.
   - `src/pages/ProductForm.jsx`:
     - o `useEffect` agora depende de `[id, isEditing]`, zera o formulário no cadastro e recarrega o produto na edição;
     - nova função `validate()`: nome e categoria obrigatórios, preço ≥ 0, quantidade inteira ≥ 0.
3. **Testes no navegador** (prints em `evidencias/`):
   - `Captura de tela 2026-11-19 213411.png`: `localhost:3001/product` retornou `{}`, enquanto `/products` trouxe os 4 produtos.
   - `Captura de tela 2026-11-19 213158.png`: listagem funcionando e `GET /products` na aba Network.
   - `Captura de tela 2026-11-19 213804.png`: produto "violao" cadastrado (POST) com R$ 500,00.
   - `Captura de tela 2026-11-19 213955.png`: "violao" editado (PUT) para R$ 400,00.
4. **Testes sem o navegador** (o serviço rodando no Node contra um JSON Server temporário):
   - POST retornou 201, PUT 200 (com `id` numérico) e DELETE 200;
   - `DELETE /products/undefined` retornou 404;
   - com a API desligada, apareceu a mensagem em português;
   - a `validate()` deu a mensagem certa para cada caso inválido.
5. **`vite build`:** passou sem erros.

## Pendências

- [ ] Escrever a **Reflexão** no final do `RELATORIO.md`, com as suas palavras.
- [ ] Marcar as caixinhas dos **Critérios de aceite** no `RELATORIO.md`, depois de conferir cada uma.
- [ ] (Opcional) Tirar prints da aba Network (F12 → Rede → Fetch/XHR) mostrando:
  - `POST /products` com status 201;
  - `PUT /products/:id` com status 200;
  - `DELETE /products/:id` com status 200;
  - uma mensagem de validação na tela (ex.: salvar com o nome vazio).

  Salve os prints em `evidencias/` e cite-os no relatório.
- [ ] (Opcional) Testar ao vivo e tirar print:
  - parar o `npm run server` e recarregar a listagem (Falha 7);
  - ir de "Editar" para "Cadastrar produto" e ver o formulário vazio (Falha 4).
- [ ] Decidir se o `db.json` fica com o produto de teste "violao" (id 5) ou volta aos 4 produtos originais.
- [ ] Entregar sem a pasta `node_modules`, que já está no `.gitignore`.

## Ao terminar em casa

```bash
git add -A
git commit -m "Finaliza relatório"
git push origin main
```
