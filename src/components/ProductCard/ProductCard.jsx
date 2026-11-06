// src/components/ProductCard/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';
import { priceLabel } from '../../utils/format';

const ProductCard = ({ product }) => {
  const isQuote = product.price_cents == null;

  return (
    <div className="product-card">
      <Link to={`/produto/${product.slug}`} className="product-image-link">
        <div className="product-image">
          <img src={product.image} alt={product.name} loading="lazy" />
          {product.is_new && <span className="product-badge">Novo</span>}
        </div>
      </Link>
      <div className="product-info">
        <Link to={`/produto/${product.slug}`} className="product-name-link">
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <div className="product-price-block">
            <span className={`product-price ${isQuote ? 'quote' : ''}`}>{priceLabel(product)}</span>
            {product.min_qty > 1 && (
              <span className="product-min-qty">Mínimo de {product.min_qty} unidades</span>
            )}
          </div>
          <Link to={`/produto/${product.slug}`} className="btn add-to-cart-btn">
            {isQuote ? 'Pedir orçamento' : 'Escolher opções'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
