// src/components/Cart/Cart.jsx
import React from 'react';
import './Cart.css';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';

const Cart = ({ isOpen, closeCart, cartItems, removeFromCart, updateQuantity, cartTotal }) => {
  return (
    <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={closeCart}>
      <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h3>
            <ShoppingBag size={24} />
            Seu Carrinho
          </h3>
          <button className="close-cart" onClick={closeCart}>
            <X size={24} />
          </button>
        </div>
        
        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={64} />
              <p>Seu carrinho está vazio</p>
              <button className="btn" onClick={closeCart}>
                Continuar Comprando
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-price">R$ {item.price.toFixed(2)}</p>
                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button 
                            className="quantity-btn" 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button 
                            className="quantity-btn" 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button 
                          className="remove-item" 
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Entrega</span>
                  <span>Grátis</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                
                <button className="btn checkout-btn">
                  Finalizar Compra
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;