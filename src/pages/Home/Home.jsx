// src/pages/Home/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Home.css';

const FEATURED_COUNT = 8;

const Home = ({ products, loading, error, onRetry }) => {
  const featured = products.slice(0, FEATURED_COUNT);

  return (
    <div className="home-page">
      <HeroBanner />

      <section id="products" className="products-section">
        <div className="container">
          <h2 className="section-title">Nossas Delícias</h2>

          {loading && <p className="catalog-status">Carregando o cardápio...</p>}
          {error && (
            <div className="catalog-status">
              <p>{error}</p>
              <button className="btn" onClick={onRetry}>Tentar novamente</button>
            </div>
          )}

          <div className="products-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.length > FEATURED_COUNT && (
            <div className="catalog-more">
              <Link to="/produtos" className="btn">Ver cardápio completo</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
