// src/App.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import About from './pages/About/About';
import Products from './pages/Products/Products';
import Login from './pages/Auth/Login/Login';
import Register from './pages/Auth/Register/Register';
import Checkout from './pages/Checkout/Checkout';
import Order from './pages/Order/Order';
import Profile from './pages/Profile/Profile';
import Admin from './pages/Admin/Admin';
import Footer from './components/Footer/Footer';
import Cart from './components/Cart/Cart';
import Contact from './pages/Contact/Contact';
import { api } from './services/api';
import { labelSelections } from './utils/format';
import './App.css';

const readJSON = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

// Rotas que exigem login (e, opcionalmente, conta de administrador)
function PrivateRoute({ isAuthenticated, adminOnly, user, children }) {
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (adminOnly && !user?.is_admin) return <Navigate to="/" replace />;
  return children;
}

// Login/cadastro: quem já está logado volta para onde estava indo
function GuestRoute({ isAuthenticated, children }) {
  const location = useLocation();
  return isAuthenticated ? <Navigate to={location.state?.from || '/'} replace /> : children;
}

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [config, setConfig] = useState(null);
  const [catalogError, setCatalogError] = useState('');
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const [cartItems, setCartItems] = useState(() => readJSON('cart', []));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(() => readJSON('user', null));
  const isAuthenticated = Boolean(user && localStorage.getItem('token'));

  // Catálogo vem do back-end
  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    setCatalogError('');
    try {
      const [p, c, cfg] = await Promise.all([api.products(), api.categories(), api.config()]);
      setProducts(p.products);
      setCategories(c.categories);
      setConfig(cfg);
    } catch (error) {
      setCatalogError(error.message);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  useEffect(() => { loadCatalog(); }, [loadCatalog]);

  // Carrinho persistido
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Autenticação
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleUserUpdate = (fresh) => {
    localStorage.setItem('user', JSON.stringify(fresh));
    setUser(fresh);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    // Revalida a sessão ao abrir o site
    if (localStorage.getItem('token')) {
      api.me().then(({ user: fresh }) => {
        localStorage.setItem('user', JSON.stringify(fresh));
        setUser(fresh);
      }).catch(() => {});
    }
    window.addEventListener('auth:expired', handleLogout);
    return () => window.removeEventListener('auth:expired', handleLogout);
  }, [handleLogout]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Carrinho: cada linha = produto + escolhas (sabor, recheio...)
  const addToCart = (product, quantity, selections = {}) => {
    const lineId = `${product.id}:${JSON.stringify(selections)}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.lineId === lineId);
      if (existing) {
        return prev.map((item) =>
          item.lineId === lineId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, {
        lineId,
        product_id: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        price_cents: product.price_cents,
        min_qty: product.min_qty,
        deposit_percent: product.deposit_percent,
        variable_price: product.variable_price,
        selections,
        selectionsLabelled: labelSelections(product, selections),
        quantity,
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (lineId) => setCartItems((prev) => prev.filter((i) => i.lineId !== lineId));

  const updateQuantity = (lineId, quantity) => {
    setCartItems((prev) =>
      prev.map((item) => (item.lineId === lineId ? { ...item, quantity: Math.max(item.min_qty, quantity) } : item))
    );
  };

  const clearCart = () => setCartItems([]);

  // Valores em centavos. O servidor recalcula tudo no pedido; aqui é só exibição.
  const cartTotals = useMemo(() => {
    const subtotal = cartItems.reduce((t, i) => t + i.price_cents * i.quantity, 0);
    const dueNow = cartItems.reduce(
      (t, i) => t + Math.ceil((i.price_cents * i.quantity * i.deposit_percent) / 100), 0);
    return { subtotal, dueNow };
  }, [cartItems]);

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
          categories={categories}
        />
        <main>
          <Routes>
            <Route path="/" element={
              <Home products={products} loading={loadingCatalog} error={catalogError} onRetry={loadCatalog} />} />
            <Route path="/produto/:slug" element={
              <ProductDetail products={products} loading={loadingCatalog} addToCart={addToCart} config={config} />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/produtos" element={
              <Products products={products} categories={categories} loading={loadingCatalog}
                error={catalogError} onRetry={loadCatalog} />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/login" element={
              <GuestRoute isAuthenticated={isAuthenticated}><Login onLogin={handleLogin} /></GuestRoute>} />
            <Route path="/cadastro" element={
              <GuestRoute isAuthenticated={isAuthenticated}><Register onRegister={handleLogin} /></GuestRoute>} />
            <Route path="/checkout" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Checkout cartItems={cartItems} cartTotals={cartTotals} config={config} user={user}
                  clearCart={clearCart} />
              </PrivateRoute>} />
            <Route path="/pedido/:id" element={
              <PrivateRoute isAuthenticated={isAuthenticated}><Order config={config} /></PrivateRoute>} />
            <Route path="/perfil" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Profile user={user} onUserUpdate={handleUserUpdate} onLogout={handleLogout} />
              </PrivateRoute>} />
            <Route path="/meus-pedidos" element={<Navigate to="/perfil?aba=pedidos" replace />} />
            <Route path="/admin" element={
              <PrivateRoute isAuthenticated={isAuthenticated} adminOnly user={user}><Admin /></PrivateRoute>} />
          </Routes>
        </main>
        <Footer />
        <Cart
          isOpen={isCartOpen}
          closeCart={() => setIsCartOpen(false)}
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          cartTotals={cartTotals}
        />
      </div>
    </Router>
  );
}

export default App;
