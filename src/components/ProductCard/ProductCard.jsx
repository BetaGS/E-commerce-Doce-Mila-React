// Atualize o src/components/ProductCard/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';
import { Star } from 'lucide-react';

const ProductCard = ({ product, addToCart }) => {
  return (
    <div className="product-card">
      <Link to={`/produto/${product.id}`} className="product-image-link">
        <div className="product-image">
          <img src={product.image} alt={product.name} />
          {product.isNew && <span className="product-badge">Novo</span>}
        </div>
      </Link>
      <div className="product-info">
        <Link to={`/produto/${product.id}`} className="product-name-link">
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-description">{product.description}</p>
        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              fill={i < product.rating ? "#ffc107" : "#e4e5e9"}
              color={i < product.rating ? "#ffc107" : "#e4e5e9"}
            />
          ))}
          <span className="rating-count">({product.reviewCount})</span>
        </div>
        <div className="product-footer">
          <span className="product-price">R$ {product.price.toFixed(2)}</span>
          <button className="btn add-to-cart-btn" onClick={() => addToCart(product)}>
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;