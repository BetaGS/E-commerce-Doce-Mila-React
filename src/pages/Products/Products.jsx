// src/pages/Products/Products.jsx
import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './Products.css';
import { Search, Filter, Sliders, X, ShoppingBag, Grid, List } from 'lucide-react';
import { formatBRL, priceLabel } from '../../utils/format';

const WHATSAPP = '5521996911177';

const Products = ({ products, categories, loading, error, onRetry }) => {
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [maxPriceFilter, setMaxPriceFilter] = useState(null); // null = sem limite

  // Busca e categoria ficam na URL (a barra de busca do menu usa os mesmos parâmetros)
  const searchTerm = params.get('search') || '';
  const selectedCategory = params.get('categoria') || 'todos';

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  const priced = products.filter((p) => p.price_cents != null);
  const priceCeiling = Math.max(100, Math.ceil(Math.max(0, ...priced.map((p) => p.price_cents)) / 100));
  const maxPrice = maxPriceFilter ?? priceCeiling;
  const priceActive = maxPriceFilter !== null && maxPriceFilter < priceCeiling;

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let result = products.filter((p) => {
      if (term && !`${p.name} ${p.description} ${p.category}`.toLowerCase().includes(term)) return false;
      if (selectedCategory !== 'todos' && p.category_slug !== selectedCategory) return false;
      if (p.price_cents != null && p.price_cents / 100 > maxPrice) return false;
      return true;
    });
    const byPrice = (dir) => (a, b) => {
      // "Sob consulta" sempre no fim
      if (a.price_cents == null) return 1;
      if (b.price_cents == null) return -1;
      return dir * (a.price_cents - b.price_cents);
    };
    if (sortBy === 'price-asc') result = [...result].sort(byPrice(1));
    if (sortBy === 'price-desc') result = [...result].sort(byPrice(-1));
    if (sortBy === 'name-asc') result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    return result;
  }, [products, searchTerm, selectedCategory, maxPrice, sortBy]);

  const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name || slug;
  const hasFilters = Boolean(searchTerm) || selectedCategory !== 'todos' || priceActive;

  const clearFilters = () => {
    setParams({}, { replace: true });
    setMaxPriceFilter(null);
    setSortBy('relevance');
  };

  return (
    <div className="products-page">
      <section className="products-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Nossas Delícias</h1>
            <p className="hero-subtitle">
              Bolos, docinhos e kits festa artesanais, feitos sob encomenda na Tijuca
            </p>
          </div>
        </div>
      </section>

      <section className="products-filters">
        <div className="container">
          <div className="filters-header">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => updateParam('search', e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => updateParam('search', '')} aria-label="Limpar busca">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="filters-controls">
              <button className="btn filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                <Filter size={18} />
                Filtros
              </button>

              <div className="view-mode">
                <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')} aria-label="Visualização em grade">
                  <Grid size={18} />
                </button>
                <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')} aria-label="Visualização em lista">
                  <List size={18} />
                </button>
              </div>

              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="relevance">Ordenar por: Cardápio</option>
                <option value="price-asc">Preço: Menor para Maior</option>
                <option value="price-desc">Preço: Maior para Menor</option>
                <option value="name-asc">Nome: A-Z</option>
              </select>
            </div>
          </div>

          <div className={`filters-expanded ${showFilters ? 'show' : ''}`}>
            <div className="filters-grid">
              <div className="filter-group">
                <h4 className="filter-title"><ShoppingBag size={18} /> Categorias</h4>
                <div className="category-list">
                  <button
                    className={`category-btn ${selectedCategory === 'todos' ? 'active' : ''}`}
                    onClick={() => updateParam('categoria', '')}
                  >
                    <span>Todos os Produtos</span>
                    <span className="category-count">({products.length})</span>
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.slug}
                      className={`category-btn ${selectedCategory === c.slug ? 'active' : ''}`}
                      onClick={() => updateParam('categoria', c.slug)}
                    >
                      <span>{c.name}</span>
                      <span className="category-count">({c.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h4 className="filter-title"><Sliders size={18} /> Preço máximo</h4>
                <div className="price-filter">
                  <div className="price-range">
                    <span>R$ 0</span>
                    <span>até R$ {maxPrice}</span>
                  </div>
                  <input
                    type="range" min="1" max={priceCeiling} step="1" value={maxPrice}
                    onChange={(e) => setMaxPriceFilter(parseInt(e.target.value, 10))}
                    className="range-slider" aria-label="Preço máximo"
                  />
                  <p className="filter-hint">Produtos “sob consulta” sempre aparecem.</p>
                </div>
              </div>

              <div className="filter-group">
                <div className="active-filters">
                  {searchTerm && (
                    <span className="active-filter">Busca: “{searchTerm}”
                      <button onClick={() => updateParam('search', '')}><X size={12} /></button>
                    </span>
                  )}
                  {selectedCategory !== 'todos' && (
                    <span className="active-filter">Categoria: {categoryName(selectedCategory)}
                      <button onClick={() => updateParam('categoria', '')}><X size={12} /></button>
                    </span>
                  )}
                  {priceActive && (
                    <span className="active-filter">Até {formatBRL(maxPrice * 100)}
                      <button onClick={() => setMaxPriceFilter(null)}><X size={12} /></button>
                    </span>
                  )}
                  {hasFilters && <button className="clear-all-btn" onClick={clearFilters}>Limpar todos</button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="products-results">
        <div className="container">
          {loading && <p className="catalog-status">Carregando o cardápio...</p>}
          {error && (
            <div className="no-results">
              <p>{error}</p>
              <button className="btn" onClick={onRetry}>Tentar novamente</button>
            </div>
          )}

          {!loading && !error && (
            <div className="results-header">
              <h2 className="results-title">
                {filtered.length} {filtered.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </h2>
              {filtered.length === 0 && (
                <div className="no-results">
                  <p>Nenhum produto encontrado com os filtros selecionados.</p>
                  <button className="btn" onClick={clearFilters}>Limpar filtros</button>
                </div>
              )}
            </div>
          )}

          {filtered.length > 0 && (
            <div className={`products-container ${viewMode}`}>
              {filtered.map((product) => (
                <div key={product.id} className="product-card">
                  <Link to={`/produto/${product.slug}`} className="product-image-link">
                    <div className="product-image">
                      <img src={product.image} alt={product.name} loading="lazy" />
                      {product.is_new && <span className="product-badge">Novo</span>}
                    </div>
                  </Link>
                  <div className="product-info">
                    <div className="product-header">
                      <Link to={`/produto/${product.slug}`} className="product-name-link">
                        <h3 className="product-name">{product.name}</h3>
                      </Link>
                      <span className="product-price">{priceLabel(product)}</span>
                    </div>

                    <p className="product-description">{product.description}</p>

                    <div className="product-meta">
                      <span className="product-category">{product.category}</span>
                      {product.min_qty > 1 && <span className="rating-count">Mínimo de {product.min_qty} un.</span>}
                    </div>

                    <div className="product-actions">
                      <Link to={`/produto/${product.slug}`} className="btn add-to-cart-btn">
                        {product.price_cents == null ? 'Pedir orçamento' : 'Escolher opções'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="products-banner">
        <div className="container">
          <div className="banner-content">
            <h2>Encomendas Especiais</h2>
            <p>Precisa de algo personalizado para sua festa ou evento especial?</p>
            <p className="banner-highlight">Fazemos encomendas personalizadas!</p>
            <div className="banner-actions">
              <a className="btn" target="_blank" rel="noopener noreferrer"
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Olá! Gostaria de um orçamento para uma encomenda.')}`}>
                Solicitar Orçamento
              </a>
              <a href="tel:+5521996911177" className="btn btn-secondary">Ligar Agora</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
