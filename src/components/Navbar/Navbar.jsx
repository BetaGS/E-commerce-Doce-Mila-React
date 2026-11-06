// src/components/Navbar/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { ShoppingCart, Menu, X, User, Search, ChevronDown } from 'lucide-react';

const Navbar = ({ cartItemsCount, openCart, isAuthenticated, user, onLogout, categories = [] }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const categoriesRef = useRef(null);

  const navLinks = [
    { path: '/', label: 'Início' },
    { path: '/produtos', label: 'Produtos' },
    { path: '/sobre', label: 'Sobre Nós' },
    { path: '/contato', label: 'Contato' },
    ...(isAuthenticated ? [] : [{ path: '/login', label: 'Login' }]),
    ...(user?.is_admin ? [{ path: '/admin', label: 'Painel' }] : []),
  ];

  // Categorias reais, vindas do catálogo
  const productCategories = categories.map((c, index) => ({ id: index, name: c.name, slug: c.slug }));

  // Bloqueia o scroll do body quando o menu está aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuOpen]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produtos?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleCategorySelect = (category) => {
    navigate(`/produtos?categoria=${category.slug}`);
    setShowCategories(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="container">
          <div className="navbar-content">
            {/* Logo */}
            <Link to="/" className="navbar-logo">
              <h1>Doce Mila</h1>
              <p>Confeitaria Artesanal</p>
            </Link>

            {/* Barra de Pesquisa Desktop */}
            <div className="navbar-search-desktop">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <div className="search-categories" ref={categoriesRef}>
                    <button
                      type="button"
                      className="categories-toggle"
                      onClick={() => setShowCategories(!showCategories)}
                    >
                      Categorias
                      <ChevronDown size={16} />
                    </button>
                    {showCategories && (
                      <div className="categories-dropdown">
                        {productCategories.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            className="category-item"
                            onClick={() => handleCategorySelect(category)}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button type="submit" className="search-submit">
                  Buscar
                </button>
              </form>
            </div>

            {/* Navegação Desktop */}
            <nav className="navbar-desktop">
              <ul className="nav-links">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link 
                      to={link.path} 
                      className={isActive(link.path) ? 'active' : ''}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {isAuthenticated && (
                  <li><Link to="/" onClick={onLogout}>Sair</Link></li>
                )}
              </ul>
            </nav>

            {/* Ações */}
            <div className="navbar-actions">
              {/* Botão de Pesquisa Mobile */}
              <button 
                className="search-toggle"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label={isSearchOpen ? 'Fechar busca' : 'Abrir busca'}
              >
                <Search size={20} />
              </button>

              {/* Conta */}
              <Link to={isAuthenticated ? '/perfil' : '/login'} className="account-btn" aria-label="Minha conta">
                <User size={20} />
              </Link>

              {/* Carrinho */}
              <button 
                className="cart-btn" 
                onClick={openCart}
                aria-label="Abrir carrinho"
              >
                <ShoppingCart size={22} />
                {cartItemsCount > 0 && (
                  <span className="cart-count">{cartItemsCount}</span>
                )}
              </button>

              {/* Menu Toggle Button */}
              <button 
                className="menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Barra de Pesquisa Mobile Expandida */}
          {isSearchOpen && (
            <div className="navbar-search-mobile">
              <form onSubmit={handleSearch} className="search-form-mobile">
                <div className="search-input-wrapper-mobile">
                  <Search size={20} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input-mobile"
                    autoFocus
                  />
                  <button type="submit" className="search-submit-mobile">
                    Buscar
                  </button>
                </div>
                <div className="search-categories-mobile">
                  <span className="categories-label">Categorias:</span>
                  <div className="categories-buttons">
                    {productCategories.slice(0, 4).map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        className="category-chip"
                        onClick={() => handleCategorySelect(category)}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* NAVEGAÇÃO MOBILE */}
      <div className={`navbar-mobile ${isMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav">
          {/* Barra de Pesquisa no Menu Mobile */}
          <div className="mobile-search-container">
            <form onSubmit={handleSearch} className="mobile-search-form">
              <div className="mobile-search-input-wrapper">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mobile-search-input"
                />
              </div>
              <button type="submit" className="mobile-search-button">
                Buscar
              </button>
            </form>
            
            <div className="mobile-categories">
              <h4>Categorias Populares</h4>
              <div className="mobile-categories-grid">
                {productCategories.map((category) => (
                  <button
                    key={category.id}
                    className="mobile-category-btn"
                    onClick={() => {
                      handleCategorySelect(category);
                      setIsMenuOpen(false);
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ul className="mobile-nav-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={isActive(link.path) ? 'active' : ''}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mobile-actions">
            <Link
              to={isAuthenticated ? '/perfil' : '/login'}
              className="btn-outline"
              onClick={() => setIsMenuOpen(false)}
            >
              <User size={18} />
              {isAuthenticated ? `Olá, ${user?.name?.split(' ')[0] || 'cliente'}` : 'Minha Conta'}
            </Link>
            {isAuthenticated && (
              <Link to="/" className="btn-outline" onClick={() => { setIsMenuOpen(false); onLogout(); }}>
                Sair
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;