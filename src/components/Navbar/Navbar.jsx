// src/components/Navbar/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { ShoppingCart, Menu, X, Search, User } from 'lucide-react';

const Navbar = ({ cartItemsCount, openCart }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // DICA BÔNUS: Cria uma referência para o input de busca
  const searchInputRef = useRef(null);

  const navLinks = [
    { path: '/', label: 'Início' },
    { path: '/produtos', label: 'Produtos' },
    { path: '/sobre', label: 'Sobre Nós' },
    { path: '/contato', label: 'Contato' },
    { path: '/login', label: 'Login' },
  ];

  // DICA BÔNUS: Foca automaticamente no input quando a barra de busca abre
  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produtos?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
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
              </ul>
            </nav>

            {/* Ações */}
            <div className="navbar-actions">
              {/* Busca */}
              <div className="search-container">
                <button 
                  className="search-toggle"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  aria-label="Abrir busca"
                >
                  <Search size={20} />
                </button>
                
                <div className={`search-box ${isSearchOpen ? 'open' : ''}`}>
                  <form onSubmit={handleSearch}>
                    <input
                      ref={searchInputRef} // ADICIONADO: Conecta a referência ao input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                    <button type="submit" className="search-submit">
                      <Search size={18} />
                    </button>
                    <button 
                      type="button" 
                      className="search-close"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <X size={18} />
                    </button>
                  </form>
                </div>
              </div>

              {/* Conta */}
              <Link to="/login" className="account-btn" aria-label="Minha conta">
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

              {/* Menu Mobile */}
              <button 
                className="menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Navegação Mobile */}
          <div className={`navbar-mobile ${isMenuOpen ? 'open' : ''}`}>
            <nav className="mobile-nav">
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
                  to="/minha-conta" 
                  className="btn btn-outline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} />
                  Minha Conta
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Overlay para mobile */}
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