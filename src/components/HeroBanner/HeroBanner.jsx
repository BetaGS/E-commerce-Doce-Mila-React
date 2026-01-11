// src/components/HeroBanner/HeroBanner.jsx
import React from 'react';
import './HeroBanner.css';
import { Link } from 'react-router-dom';

const HeroBanner = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h2>Doces feitos com amor e carinho</h2>
          <p>Descubra nossos bolos, tortas e doces artesanais feitos com os melhores ingredientes</p>
          <Link to="/produtos" className="btn btn-primary">Ver Produtos</Link>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;