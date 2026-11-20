const API_URL = 'http://localhost:3001'

// Executa a requisição e traduz falhas de rede (API desligada, CORS etc.)
// em uma mensagem compreensível para o usuário.
async function request(url, options, errorMessage) {
  let response
  try {
    response = await fetch(url, options)
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o JSON Server está em execução (npm run server).')
  }
  if (!response.ok) throw new Error(errorMessage)
  return response
}

// Serviço responsável pela comunicação com a API mockada.
export async function getProducts() {
  const response = await request(`${API_URL}/products`, undefined, 'Não foi possível carregar os produtos.')
  return response.json()
}

export async function getProductById(id) {
  const response = await request(`${API_URL}/products/${id}`, undefined, 'Produto não encontrado.')
  return response.json()
}

export async function createProduct(product) {
  const response = await request(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  }, 'Não foi possível cadastrar o produto.')
  return response.json()
}

export async function updateProduct(id, product) {
  // O id vindo do useParams é string; convertemos para manter o tipo numérico no db.json.
  const response = await request(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...product, id: Number(id) }),
  }, 'Não foi possível atualizar o produto.')
  return response.json()
}

export async function deleteProduct(id) {
  await request(`${API_URL}/products/${id}`, {
    method: 'DELETE',
  }, 'Não foi possível excluir o produto.')
  return true
}
