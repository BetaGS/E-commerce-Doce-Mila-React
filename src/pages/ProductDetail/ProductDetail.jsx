import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, MessageCircle } from 'lucide-react';
import './ProductDetail.css';
import './ProductOptions.css';
import { formatBRL, priceLabel, labelSelections, selectionsText, buildWhatsAppLink } from '../../utils/format';

const SELECT_THRESHOLD = 6; // acima disso, lista suspensa em vez de botões

function OptionGroup({ group, value, onChange }) {
  if (group.type === 'text') {
    return (
      <input
        type="text"
        className="opt-text"
        maxLength={140}
        value={value || ''}
        placeholder={group.help || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (group.type === 'single') {
    if (group.choices.length > SELECT_THRESHOLD) {
      return (
        <select className="opt-select" value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Escolha uma opção</option>
          {group.choices.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      );
    }
    return (
      <div className="opt-chips" role="radiogroup" aria-label={group.label}>
        {group.choices.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={value === c}
            className={`opt-chip ${value === c ? 'selected' : ''}`}
            onClick={() => onChange(c)}
          >
            {c}
          </button>
        ))}
      </div>
    );
  }

  // multi
  const selected = Array.isArray(value) ? value : [];
  const toggle = (choice) => {
    if (selected.includes(choice)) onChange(selected.filter((c) => c !== choice));
    else if (selected.length < group.max) onChange([...selected, choice]);
  };
  return (
    <div className="opt-chips" role="group" aria-label={group.label}>
      {group.choices.map((c) => {
        const isOn = selected.includes(c);
        const blocked = !isOn && selected.length >= group.max;
        return (
          <button
            key={c}
            type="button"
            aria-pressed={isOn}
            disabled={blocked}
            className={`opt-chip ${isOn ? 'selected' : ''}`}
            onClick={() => toggle(c)}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}

const ProductDetail = ({ products, loading, addToCart, config }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.slug === slug);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState({});
  const [error, setError] = useState('');

  // Ao trocar de produto, volta ao estado inicial (quantidade = mínimo do cardápio)
  useEffect(() => {
    setSelections({});
    setSelectedImage(0);
    setError('');
    setQuantity(product ? product.min_qty : 1);
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && !product) return <div className="container"><h2>Carregando...</h2></div>;

  if (!product) {
    return (
      <div className="product-not-found">
        <div className="container">
          <h2>Produto não encontrado</h2>
          <button className="btn" onClick={() => navigate('/produtos')}>Ver todos os produtos</button>
        </div>
      </div>
    );
  }

  const gallery = [product.image, ...(product.gallery || [])];
  const isQuote = product.price_cents == null;
  const step = product.min_qty >= 20 ? 5 : 1;
  const total = isQuote ? 0 : product.price_cents * quantity;
  const deposit = Math.ceil((total * product.deposit_percent) / 100);

  const setOption = (key, value) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  // Mesma regra do servidor, para avisar o cliente antes de enviar
  const validate = () => {
    for (const group of product.options) {
      const value = selections[group.key];
      if (group.type === 'multi') {
        const count = Array.isArray(value) ? value.length : 0;
        if (count < (group.min ?? 0)) return `Escolha pelo menos ${group.min} em “${group.label}”.`;
      } else if (group.required !== false && !value?.toString().trim()) {
        return `Preencha “${group.label}”.`;
      }
    }
    if (quantity < product.min_qty) return `A quantidade mínima é ${product.min_qty}.`;
    return '';
  };

  const handleAdd = () => {
    const problem = validate();
    if (problem) return setError(problem);
    addToCart(product, quantity, selections);
  };

  const handleQuote = () => {
    const problem = validate();
    if (problem) return setError(problem);
    const lines = labelSelections(product, selections);
    const text =
      `Olá! Gostaria de um orçamento:\n*${product.name}*\n${selectionsText(lines).split(' · ').join('\n')}\n` +
      `Quantidade: ${quantity}`;
    window.open(buildWhatsAppLink(config?.whatsapp_number || '5521996911177', text), '_blank', 'noopener,noreferrer');
  };

  const changeQty = (delta) => setQuantity((q) => Math.max(product.min_qty, q + delta));

  return (
    <div className="product-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Voltar
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
                    key={img}
                    className={`thumbnail-btn ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`Ver foto ${index + 1}`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="product-header">
              <span className="product-category">{product.category}</span>
              {product.is_new && <span className="product-new-badge">Novo</span>}
            </div>

            <h1 className="product-title">{product.name}</h1>
            <p className="product-description">{product.description}</p>
            {product.notes && <p className="product-notes">{product.notes}</p>}

            <div className="opt-list">
              {product.options.map((group) => (
                <div key={group.key} className="opt-group">
                  <h3 className="opt-label">
                    {group.label}
                    {group.type === 'multi' && (
                      <span className="opt-count"> ({(selections[group.key] || []).length}/{group.max})</span>
                    )}
                  </h3>
                  <OptionGroup group={group} value={selections[group.key]} onChange={(v) => setOption(group.key, v)} />
                </div>
              ))}
            </div>

            <div className="product-actions">
              <span className="product-price">{priceLabel(product)}</span>

              <div className="quantity-control">
                <button onClick={() => changeQty(-step)} disabled={quantity - step < product.min_qty} aria-label="Diminuir">
                  <Minus size={16} />
                </button>
                <span className="quantity">{quantity}</span>
                <button onClick={() => changeQty(step)} aria-label="Aumentar"><Plus size={16} /></button>
              </div>

              {!isQuote && (
                <p className="opt-total">
                  Total: <strong>{formatBRL(total)}</strong>
                  {product.deposit_percent < 100
                    ? <span> · sinal de {product.deposit_percent}% para confirmar: {formatBRL(deposit)}</span>
                    : <span> · pagamento integral para confirmar</span>}
                </p>
              )}
              {product.variable_price && !isQuote && (
                <p className="opt-total-note">O valor final pode variar conforme a decoração. Confirmamos pelo WhatsApp.</p>
              )}

              {error && <p className="opt-error" role="alert">{error}</p>}

              {isQuote ? (
                <button className="btn add-to-cart-btn-large opt-whatsapp" onClick={handleQuote}>
                  <MessageCircle size={18} /> Pedir orçamento pelo WhatsApp
                </button>
              ) : (
                <button className="btn add-to-cart-btn-large" onClick={handleAdd}>
                  Adicionar ao Carrinho
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
