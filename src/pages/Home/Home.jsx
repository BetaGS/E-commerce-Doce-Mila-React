import React from 'react'
import ProductCard from '../../components/ProductCard/ProductCard'
import './Home.css'

const mockProducts = [
  { id: 1, name: 'Bolo de Morango Especial', price: 45.00, image: 'bolo-morango.jpg' },
  { id: 2, name: 'Caixa de Brigadeiros Gourmet', price: 25.00, image: 'brigadeiros.jpg' },
  { id: 3, name: 'Cupcake Red Velvet', price: 12.00, image: 'cupcake.jpg' },
]

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>Bem-vindo à Doce Mila</h1>
        <p>Os melhores doces artesanais feitos com carinho para você.</p>
      </section>
      <section className="featured-section">
        <h2>Destaques</h2>
        <div className="product-grid">
          {mockProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home