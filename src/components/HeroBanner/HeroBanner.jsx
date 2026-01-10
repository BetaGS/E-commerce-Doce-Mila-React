// src/components/HeroBanner/HeroBanner.jsx
import React from 'react';
import './HeroBanner.css';

const HeroBanner = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h2>Doces feitos com amor e carinho</h2>
          <p>Descubra nossos bolos, tortas e doces artesanais feitos com os melhores ingredientes</p>
          <a href="#products" className="btn">Ver Produtos</a>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;