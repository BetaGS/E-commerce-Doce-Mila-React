import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">Doce Mila 🍰</Link>
        <nav className="navbar-links">
          <Link to="/">Início</Link>
          <Link to="/produtos">Produtos</Link>
          <Link to="/sobre">Sobre</Link>
          <Link to="/contato">Contato</Link>
          <Link to="/carrinho" className="cart-link">Carrinho 🛒</Link>
          <Link to="/login" className="btn-login">Entrar</Link>
        </nav>
      </div>
    </header>
  )
}

export default Navbar