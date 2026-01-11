// src/App.jsx (atualizado)
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import About from './pages/About/About';
import Products from './pages/Products/Products';
import Login from './pages/Auth/Login/Login';
import Register from './pages/Auth/Register/Register';
import Footer from './components/Footer/Footer';
import Cart from './components/Cart/Cart';
import './App.css';

// Dados dos produtos
const productsData = [
  { 
    id: 1, 
    name: 'Bolo de Pote Chocolate', 
    price: 15.0, 
    image: '/images/Logo.jpg',
    category: 'Bolos',
    description: 'Bolo de chocolate macio com recheio de brigadeiro cremoso',
    rating: 4.5,
    reviewCount: 32,
    isNew: true
  },
  { 
    id: 2, 
    name: 'Brigadeiro Gourmet', 
    price: 5.0, 
    image: '/images/Logo.jpg',
    category: 'Doces',
    description: 'Brigadeiro artesanal com chocolate belga e granulado especial',
    rating: 5,
    reviewCount: 47,
    isNew: false
  },
  { 
    id: 3, 
    name: 'Palha Italiana', 
    price: 7.0, 
    image: '/images/Logo.jpg',
    category: 'Doces',
    description: 'Doce feito com biscoito, leite condensado e chocolate',
    rating: 4.2,
    reviewCount: 28,
    isNew: true
  }
];

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Função de login
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Função de logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Função de cadastro
  const handleRegister = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Resto do código (scroll, carrinho) permanece igual...
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <Router>
      <div className="App">
        <Navbar 
          cartItemsCount={cartItems.length} 
          openCart={() => setIsCartOpen(true)}
          isScrolled={isScrolled}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
        />
        <main>
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} products={productsData} />} />
            <Route path="/produto/:id" element={<ProductDetail products={productsData} addToCart={addToCart} />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/produtos" element={<Products products={productsData} addToCart={addToCart} />} />
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/cadastro" element={
              isAuthenticated ? <Navigate to="/" /> : <Register onRegister={handleRegister} />
            } />
          </Routes>
        </main>
        <Footer />
        <Cart
          isOpen={isCartOpen}
          closeCart={() => setIsCartOpen(false)}
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          cartTotal={cartTotal}
        />
      </div>
    </Router>
  );
}

export default App;