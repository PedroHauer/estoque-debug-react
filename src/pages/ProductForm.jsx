import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createProduct, getProductById, updateProduct } from '../services/productService'

const initialForm = {
  name: '',
  category: '',
  price: '',
  quantity: '',
}

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(isEditing)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')

    // Mesmo componente para /products/new e /products/:id/edit:
    // ao trocar de rota o estado precisa ser reiniciado.
    if (!isEditing) {
      setForm(initialForm)
      setLoading(false)
      return
    }

    let ignore = false
    setLoading(true)

    async function loadProduct() {
      try {
        const product = await getProductById(id)
        if (ignore) return
        setForm({
          name: product.name ?? '',
          category: product.category ?? '',
          price: product.price ?? '',
          quantity: product.quantity ?? '',
        })
      } catch (err) {
        if (!ignore) setError(err.message || 'Erro ao buscar produto.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadProduct()
    return () => {
      ignore = true
    }
  }, [id, isEditing])

  function validate(values) {
    if (!String(values.name).trim()) return 'Informe o nome do produto.'
    if (!String(values.category).trim()) return 'Informe a categoria do produto.'

    if (String(values.price).trim() === '') return 'Informe o preço do produto.'
    const price = Number(values.price)
    if (!Number.isFinite(price) || price < 0) return 'O preço deve ser um número maior ou igual a zero.'

    if (String(values.quantity).trim() === '') return 'Informe a quantidade em estoque.'
    const quantity = Number(values.quantity)
    if (!Number.isInteger(quantity) || quantity < 0) return 'A quantidade deve ser um número inteiro maior ou igual a zero.'

    return ''
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const validationError = validate(form)
    if (validationError) {
      setError(validationError)
      return
    }

    const product = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    }

    try {
      if (isEditing) {
        await updateProduct(id, product)
      } else {
        await createProduct(product)
      }
      navigate('/products')
    } catch (err) {
      setError(err.message || 'Erro ao salvar produto.')
    }
  }

  if (loading) return <p className="feedback">Carregando dados do produto...</p>

  return (
    <section className="form-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">CADASTRO</span>
          <h2>{isEditing ? 'Editar produto' : 'Novo produto'}</h2>
          <p>Preencha os dados para manter o estoque atualizado.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <form className="product-form" onSubmit={handleSubmit}>
        <label>
          Nome do produto
          <input name="name" value={form.name} onChange={handleChange} placeholder="Ex.: Teclado mecânico" />
        </label>

        <label>
          Categoria
          <input name="category" value={form.category} onChange={handleChange} placeholder="Ex.: Periféricos" />
        </label>

        <div className="form-row">
          <label>
            Preço (R$)
            <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0,00" />
          </label>
          <label>
            Quantidade
            <input name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={handleChange} placeholder="0" />
          </label>
        </div>

        <div className="form-actions">
          <Link className="button secondary" to="/products">Cancelar</Link>
          <button className="button primary" type="submit">{isEditing ? 'Salvar alterações' : 'Cadastrar produto'}</button>
        </div>
      </form>
    </section>
  )
}