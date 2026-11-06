import React from 'react'
import ProductCard from '../../components/ProductCard/ProductCard'

const mockProducts = [
  { id: 1, name: 'Bolo de Morango Especial', price: 45.00, image: 'bolo-morango.jpg' },
  { id: 2, name: 'Caixa de Brigadeiros Gourmet', price: 25.00, image: 'brigadeiros.jpg' },
  { id: 3, name: 'Cupcake Red Velvet', price: 12.00, image: 'cupcake.jpg' },
  { id: 4, name: 'Torta de Limão', price: 38.00, image: 'torta-limao.jpg' }
]

const Products = () => {
  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#5c2c3b' }}>Nossos Produtos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {mockProducts.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  )
}

export default Products