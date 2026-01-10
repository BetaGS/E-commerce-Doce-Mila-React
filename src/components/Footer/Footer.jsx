// src/components/Footer/Footer.jsx (atualizado com Navbar)
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">Doce Mila</h3>
            <p>Confeitaria artesanal feita com amor e ingredientes selecionados.</p>
            <div className="social-icons">
              <a href="#" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="Email">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Links Rápidos</h4>
            <ul>
              <li><Link to="/">Início</Link></li>
              <li><Link to="/produtos">Produtos</Link></li>
              <li><Link to="/sobre">Sobre Nós</Link></li>
              <li><a href="#contact">Contato</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contato</h4>
            <ul className="contact-info">
              <li>
                <Phone size={16} />
                <span>(11) 99999-9999</span>
              </li>
              <li>
                <Mail size={16} />
                <span>contato@docemila.com.br</span>
              </li>
              <li>
                <MapPin size={16} />
                <span>Rua dos Doces, 123 - São Paulo, SP</span>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Horário de Funcionamento</h4>
            <ul>
              <li>Segunda - Sexta: 9h às 19h</li>
              <li>Sábado: 9h às 16h</li>
              <li>Domingo: Fechado</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Doce Mila Confeitaria. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;