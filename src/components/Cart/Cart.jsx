// src/components/Cart/Cart.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { formatBRL, selectionsText } from '../../utils/format';

const stepFor = (item) => (item.min_qty >= 20 ? 5 : 1);

const Cart = ({ isOpen, closeCart, cartItems, removeFromCart, updateQuantity, cartTotals }) => {
  const navigate = useNavigate();
  const hasDeposit = cartTotals.dueNow < cartTotals.subtotal;

  const goToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={closeCart}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h3>
            <ShoppingBag size={24} />
            Seu Carrinho
          </h3>
          <button className="close-cart" onClick={closeCart} aria-label="Fechar carrinho">
            <X size={24} />
          </button>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={64} />
              <p>Seu carrinho está vazio</p>
              <button className="btn" onClick={closeCart}>Continuar Comprando</button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.lineId} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{item.name}</h4>
                      {item.selectionsLabelled?.length > 0 && (
                        <p className="cart-item-options">{selectionsText(item.selectionsLabelled)}</p>
                      )}
                      <p className="cart-item-price">
                        {formatBRL(item.price_cents * item.quantity)}
                        <span className="cart-item-unit"> ({item.quantity} × {formatBRL(item.price_cents)})</span>
                      </p>
                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.lineId, item.quantity - stepFor(item))}
                            disabled={item.quantity - stepFor(item) < item.min_qty}
                            aria-label="Diminuir quantidade"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.lineId, item.quantity + stepFor(item))}
                            aria-label="Aumentar quantidade"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button className="remove-item" onClick={() => removeFromCart(item.lineId)}>
                          Remover
                        </button>
                      </div>
                      {item.min_qty > 1 && (
                        <p className="cart-item-min">Mínimo de {item.min_qty} unidades</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatBRL(cartTotals.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Entrega</span>
                  <span>Combinada no checkout</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatBRL(cartTotals.subtotal)}</span>
                </div>
                {hasDeposit && (
                  <div className="summary-row deposit">
                    <span>Sinal para confirmar o pedido</span>
                    <span>{formatBRL(cartTotals.dueNow)}</span>
                  </div>
                )}

                <button className="btn checkout-btn" onClick={goToCheckout}>
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
