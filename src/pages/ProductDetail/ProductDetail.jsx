import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Plus, Minus, Truck, Shield, RefreshCw } from 'lucide-react';
import './ProductDetail.css';

const ProductDetail = ({ products, addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // SEGURANÇA: Verifica se a lista existe antes de procurar o ID
  if (!products) return <div className="container"><h2>Carregando...</h2></div>;

  const product = products.find(p => p.id === parseInt(id));

  if (!product) {
    return (
      <div className="product-not-found">
        <div className="container">
          <h2>Produto não encontrado</h2>
          <button className="btn" onClick={() => navigate('/')}>Voltar para a loja</button>
        </div>
      </div>
    );
  }

  // Fallbacks: Garante que o .map() não rode em algo vazio ou undefined
  const ingredients = product.ingredients || [];
  const gallery = product.gallery || [product.image];
  const allergens = product.allergens || [];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setQuantity(1);
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => quantity > 1 && setQuantity(prev => prev - 1);

  return (
    <div className="product-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Voltar para a loja
        </button>

        <div className="product-detail-content">
          <div className="product-images">
            <div className="main-image">
              <img src={gallery[selectedImage]} alt={product.name} />
            </div>
            
            {gallery.length > 1 && (
              <div className="image-thumbnails">
                {gallery.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail-btn ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${product.name} thumbnail`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="product-header">
              <span className="product-category">{product.category || 'Doce'}</span>
              {product.isNew && <span className="product-new-badge">Novo</span>}
            </div>
            
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    fill={i < (product.rating || 0) ? "#ffc107" : "#e4e5e9"}
                    color={i < (product.rating || 0) ? "#ffc107" : "#e4e5e9"}
                  />
                ))}
              </div>
              <span className="rating-text">
                {(product.rating || 0).toFixed(1)} ({product.reviewCount || 0} avaliações)
              </span>
            </div>

            <p className="product-description">{product.detailedDescription}</p>

            <div className="product-ingredients">
              <h3>Ingredientes:</h3>
              <ul>
                {ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>

            <div className="product-actions">
              <span className="product-price">R$ {(product.price || 0).toFixed(2)}</span>
              <div className="quantity-control">
                <button onClick={decreaseQuantity} disabled={quantity <= 1}><Minus size={16} /></button>
                <span className="quantity">{quantity}</span>
                <button onClick={increaseQuantity}><Plus size={16} /></button>
              </div>
              <button className="btn add-to-cart-btn-large" onClick={handleAddToCart}>
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;