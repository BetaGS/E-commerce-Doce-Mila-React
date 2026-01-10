// src/pages/Products/Products.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Products.css';
import { Search, Filter, Sliders, X, Star, ShoppingBag, Grid, List } from 'lucide-react';

const Products = ({ products, addToCart }) => {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'

  // Extrair categorias únicas dos produtos
  const categories = ['todos', ...new Set(products.map(product => product.category || 'Doces'))];

  // Inicializar categorias nos produtos se não existirem
  const productsWithCategories = products.map(product => ({
    ...product,
    category: product.category || 'Doces',
    rating: product.rating || 4,
    reviewCount: product.reviewCount || Math.floor(Math.random() * 50) + 10
  }));

  // Filtrar produtos baseado nos critérios
  useEffect(() => {
    let result = [...productsWithCategories];

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term)) ||
        product.category.toLowerCase().includes(term)
      );
    }

    // Filtrar por categoria
    if (selectedCategory !== 'todos') {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Filtrar por faixa de preço
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filtrar por avaliação
    if (selectedRating > 0) {
      result = result.filter(product => product.rating >= selectedRating);
    }

    // Ordenar produtos
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating-desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Ordem padrão (relevância) - manter a ordem original
        break;
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, priceRange, sortBy, selectedRating, products]);

  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('todos');
    setPriceRange([0, 50]);
    setSortBy('relevance');
    setSelectedRating(0);
  };

  // Contar produtos por categoria
  const getCategoryCount = (category) => {
    if (category === 'todos') return productsWithCategories.length;
    return productsWithCategories.filter(product => product.category === category).length;
  };

  // Formatar preço
  const formatPrice = (price) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  // Obter imagem do produto (usa imagem padrão se não houver)
  const getProductImage = (product) => {
    return product.image || '/images/Logo.jpg';
  };

  // Calcular o preço máximo dos produtos
  const maxPrice = Math.max(...productsWithCategories.map(p => p.price), 50);

  return (
    <div className="products-page">
      {/* Hero Section */}
      <section className="products-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Nossas Delícias</h1>
            <p className="hero-subtitle">
              Descubra todos os nossos produtos artesanais feitos com amor e ingredientes selecionados
            </p>
          </div>
        </div>
      </section>

      {/* Filtros e Busca */}
      <section className="products-filters">
        <div className="container">
          <div className="filters-header">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchTerm('')}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="filters-controls">
              <button 
                className="btn filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                Filtros
              </button>
              
              <div className="view-mode">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Visualização em grade"
                >
                  <Grid size={18} />
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="Visualização em lista"
                >
                  <List size={18} />
                </button>
              </div>
              
              <select 
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Ordenar por: Relevância</option>
                <option value="price-asc">Preço: Menor para Maior</option>
                <option value="price-desc">Preço: Maior para Menor</option>
                <option value="name-asc">Nome: A-Z</option>
                <option value="rating-desc">Melhor Avaliados</option>
              </select>
            </div>
          </div>

          {/* Filtros Expandidos */}
          <div className={`filters-expanded ${showFilters ? 'show' : ''}`}>
            <div className="filters-grid">
              {/* Categorias */}
              <div className="filter-group">
                <h4 className="filter-title">
                  <ShoppingBag size={18} />
                  Categorias
                </h4>
                <div className="category-list">
                  {categories.map(category => (
                    <button
                      key={category}
                      className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <span>{category === 'todos' ? 'Todos os Produtos' : category}</span>
                      <span className="category-count">({getCategoryCount(category)})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Faixa de Preço */}
              <div className="filter-group">
                <h4 className="filter-title">
                  <Sliders size={18} />
                  Faixa de Preço
                </h4>
                <div className="price-filter">
                  <div className="price-range">
                    <span>R$ {priceRange[0].toFixed(0)}</span>
                    <span>R$ {priceRange[1].toFixed(0)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    step="1"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="range-slider"
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    step="1"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="range-slider"
                  />
                  <div className="price-inputs">
                    <input
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Math.min(parseInt(e.target.value) || 0, priceRange[1]), priceRange[1]])}
                      className="price-input"
                    />
                    <span>até</span>
                    <input
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Math.max(parseInt(e.target.value) || maxPrice, priceRange[0])])}
                      className="price-input"
                    />
                  </div>
                </div>
              </div>

              {/* Avaliação */}
              <div className="filter-group">
                <h4 className="filter-title">
                  <Star size={18} />
                  Avaliação
                </h4>
                <div className="rating-filter">
                  {[5, 4, 3].map(rating => (
                    <button
                      key={rating}
                      className={`rating-btn ${selectedRating === rating ? 'active' : ''}`}
                      onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                    >
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < rating ? "#ffc107" : "#e4e5e9"}
                            color={i < rating ? "#ffc107" : "#e4e5e9"}
                          />
                        ))}
                      </div>
                      <span className="rating-text">
                        {rating}+ estrelas
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtros Ativos */}
              <div className="filter-group">
                <div className="active-filters">
                  {searchTerm && (
                    <span className="active-filter">
                      Busca: "{searchTerm}"
                      <button onClick={() => setSearchTerm('')}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedCategory !== 'todos' && (
                    <span className="active-filter">
                      Categoria: {selectedCategory}
                      <button onClick={() => setSelectedCategory('todos')}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                    <span className="active-filter">
                      Preço: R${priceRange[0]} - R${priceRange[1]}
                      <button onClick={() => setPriceRange([0, maxPrice])}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedRating > 0 && (
                    <span className="active-filter">
                      Avaliação: {selectedRating}+ estrelas
                      <button onClick={() => setSelectedRating(0)}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  
                  {(searchTerm || selectedCategory !== 'todos' || priceRange[0] > 0 || priceRange[1] < maxPrice || selectedRating > 0) && (
                    <button className="clear-all-btn" onClick={clearFilters}>
                      Limpar todos
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="products-results">
        <div className="container">
          <div className="results-header">
            <h2 className="results-title">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </h2>
            {filteredProducts.length === 0 && (
              <div className="no-results">
                <p>Nenhum produto encontrado com os filtros selecionados.</p>
                <button className="btn" onClick={clearFilters}>
                  Limpar filtros
                </button>
              </div>
            )}
          </div>

          {/* Grid/Lista de Produtos */}
          {filteredProducts.length > 0 && (
            <div className={`products-container ${viewMode}`}>
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <Link to={`/produto/${product.id}`} className="product-image-link">
                    <div className="product-image">
                      <img src={getProductImage(product)} alt={product.name} />
                      {product.isNew && <span className="product-badge">Novo</span>}
                    </div>
                  </Link>
                  <div className="product-info">
                    <div className="product-header">
                      <Link to={`/produto/${product.id}`} className="product-name-link">
                        <h3 className="product-name">{product.name}</h3>
                      </Link>
                      <span className="product-price">{formatPrice(product.price)}</span>
                    </div>
                    
                    <p className="product-description">
                      {product.description || 'Delicioso produto artesanal feito com ingredientes selecionados.'}
                    </p>
                    
                    <div className="product-meta">
                      <span className="product-category">{product.category}</span>
                      <div className="product-rating">
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < product.rating ? "#ffc107" : "#e4e5e9"}
                              color={i < product.rating ? "#ffc107" : "#e4e5e9"}
                            />
                          ))}
                        </div>
                        <span className="rating-count">({product.reviewCount})</span>
                      </div>
                    </div>
                    
                    <div className="product-actions">
                      <button 
                        className="btn add-to-cart-btn"
                        onClick={() => addToCart(product)}
                      >
                        Adicionar ao Carrinho
                      </button>
                      <Link 
                        to={`/produto/${product.id}`} 
                        className="btn btn-outline"
                      >
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Categorias Destaque */}
          <div className="featured-categories">
            <h3 className="section-title">Navegue por Categorias</h3>
            <div className="categories-grid">
              {categories
                .filter(cat => cat !== 'todos')
                .map(category => (
                  <div 
                    key={category} 
                    className="category-card"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div className="category-image">
                      <img 
                        src={productsWithCategories.find(p => p.category === category)?.image || '/images/Logo.jpg'} 
                        alt={category} 
                      />
                      <div className="category-overlay">
                        <h4>{category}</h4>
                        <p>{getCategoryCount(category)} produtos</p>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </section>

      {/* Banner de Destaque */}
      <section className="products-banner">
        <div className="container">
          <div className="banner-content">
            <h2>Encomendas Especiais</h2>
            <p>Precisa de algo personalizado para sua festa ou evento especial?</p>
            <p className="banner-highlight">Fazemos encomendas personalizadas!</p>
            <div className="banner-actions">
              <a href="#contact" className="btn">Solicitar Orçamento</a>
              <a href="tel:+5511999999999" className="btn btn-secondary">Ligar Agora</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;