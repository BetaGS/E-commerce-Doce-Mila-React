// src/pages/Home/Home.jsx (atualizado)
import React from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Home.css';

const Home = ({ addToCart, products }) => {
  return (
    <div className="home-page">
      <HeroBanner />
      
      <section id="products" className="products-section">
        <div className="container">
          <h2 className="section-title">Nossas Delícias</h2>
          <div className="products-grid">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                addToCart={addToCart}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Remova a seção "about-section" que estava aqui */}
    </div>
  );
};

export default Home;