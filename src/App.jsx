import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import About from './pages/About/About';
import Products from './pages/Products/Products';
import Footer from './components/Footer/Footer';
import Cart from './components/Cart/Cart';
import './App.css';

// DADOS COMPLETOS: Adicionados campos obrigatórios para evitar erros de undefined
const productsData = [
  { 
    id: 1, 
    name: 'Bolo de Pote Chocolate', 
    price: 15.0, 
    image: '/images/Logo.jpg',
    category: 'Bolos',
    description: 'Bolo de chocolate macio com brigadeiro cremoso',
    detailedDescription: 'Nossa receita exclusiva de bolo de pote utiliza cacau 100% e camadas generosas.',
    ingredients: ['Leite condensado', 'Chocolate 50%', 'Farinha', 'Ovos'], // Campo obrigatório
    weight: '250g',
    servings: '1 pessoa',
    preparationTime: 'Diário',
    rating: 4.5,
    reviewCount: 32,
    isNew: true,
    gallery: ['/images/Logo.jpg'], // Campo obrigatório
    allergens: ['Lactose', 'Glúten']
  },
  { 
    id: 2, 
    name: 'Brigadeiro Gourmet', 
    price: 5.0, 
    image: '/images/Logo.jpg',
    category: 'Doces',
    description: 'Brigadeiro artesanal com chocolate belga',
    detailedDescription: 'O clássico brigadeiro brasileiro elevado ao nível gourmet.',
    ingredients: ['Leite condensado', 'Chocolate Belga', 'Manteiga'],
    weight: '20g',
    servings: '1 unidade',
    preparationTime: 'Fresco',
    rating: 5,
    reviewCount: 47,
    isNew: false,
    gallery: ['/images/Logo.jpg'],
    allergens: ['Lactose']
  }
];

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
        />
        <main>
          <Routes>
            {/* CORREÇÃO: Usando o nome correto da variável 'productsData' */}
            <Route path="/" element={<Home addToCart={addToCart} products={productsData} />} />
            <Route path="/produto/:id" element={<ProductDetail products={productsData} addToCart={addToCart} />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/produtos" element={<Products products={productsData} addToCart={addToCart} />} />
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