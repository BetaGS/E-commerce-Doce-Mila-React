// src/components/Footer/Footer.jsx (atualizado com Navbar)
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { Facebook, Instagram, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">Doce Mila</h3>
            <p>Confeitaria artesanal feita com amor e ingredientes selecionados.</p>
            <div className="social-icons">
              <a href="https://wa.me/5521996911177" aria-label="Whatsapp">
                <MessageCircle size={20} />
              </a>
              <a href="https://www.instagram.com/doce.mila.delicia/" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="doce.mila.vilar@gmail.com" aria-label="Email">
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
              <li><Link to="/contato">Contato</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contato</h4>
            <ul className="contact-info">
              <li>
                <Phone size={16} />
                <span>(21) 99691-1177</span>
              </li>
              <li>
                <Mail size={16} />
                <span>doce.mila.vilar@gmail.com</span>
              </li>
              <li>
                <MapPin size={16} />
                <span>Tijuca, Rio De Janeiro, RJ</span>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Horário de Funcionamento</h4>
            <ul>
              <li>Terça - Sexta: 9h às 19h</li>
              <li>Sabado: 9h às 16h</li>
              <li>Segunda: Fechado</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Gabriel Siqueira. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;