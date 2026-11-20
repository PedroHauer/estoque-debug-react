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
    if (!isEditing) return

    async function loadProduct() {
      try {
        const product = await getProductById(id)
        setForm({
          name: product.name,
          category: product.category,
          price: product.price,
          quantity: product.quantity,
        })
      } catch (err) {
        setError(err.message || 'Erro ao buscar produto.')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const product = {
      ...form,
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