// src/pages/Contact/Contact.jsx
import React, { useState } from 'react';
import './Contact.css';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageSquare, User } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // CONFIGURAÇÃO DA API
  const API_URL = "https://teste-java-1.onrender.com/api/contato";
  const WHATSAPP_NUMBER = "5521999472392";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!formData.subject.trim()) newErrors.subject = 'Assunto é obrigatório';
    if (!formData.message.trim()) {
      newErrors.message = 'Mensagem é obrigatória';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Mensagem muito curta';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. ENVIO PARA A API JAVA NA RENDER
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nome: formData.name,
            email: formData.email,
            mensagem: `[Assunto: ${formData.subject}] - ${formData.message} (Tel: ${formData.phone})`
        }),
      });

      if (!response.ok) throw new Error("Erro no servidor");

      // 2. ABERTURA DO WHATSAPP (OPCIONAL - FEEDBACK DIRETO)
      const text = `*NOVO CONTATO* 🚀\n\n*Nome:* ${formData.name}\n*Assunto:* ${formData.subject}\n*Mensagem:* ${formData.message}`;
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');

      // Sucesso no estado do React
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
      setTimeout(() => setIsSubmitted(false), 5000);
      
    } catch (error) {
      setErrors({ submit: 'Servidor instável. Tente novamente em instantes.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funções de auxílio de máscara de telefone mantidas...
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0,2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0,2)}) ${numbers.slice(2,7)}-${numbers.slice(7,11)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    handleChange({ ...e, target: { ...e.target, name: 'phone', value: formatted } });
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Fale Conosco</h1>
            <p className="hero-subtitle">Estamos aqui para tornar seus momentos mais doces. Entre em contato!</p>
          </div>
        </div>
      </section>

      <section className="contact-form-section">
        <div className="container">
          <div className="contact-content">
            <div className="form-container">
              <div className="form-header">
                <h2>Envie sua mensagem</h2>
                <p>O back-end Java processará seu pedido.</p>
              </div>
              
              {isSubmitted && (
                <div className="success-message">
                  <CheckCircle size={24} />
                  <div>
                    <h4>Enviado com sucesso!</h4>
                    <p>Dados registrados no servidor e WhatsApp aberto.</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="contact-form">
                {errors.submit && <div className="error-message">{errors.submit}</div>}
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name"><User size={18} /> Nome completo *</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={errors.name ? 'error' : ''} disabled={isSubmitting} />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email"><Mail size={18} /> Email *</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={errors.email ? 'error' : ''} disabled={isSubmitting} />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone"><Phone size={18} /> Telefone *</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handlePhoneChange} maxLength={15} className={errors.phone ? 'error' : ''} disabled={isSubmitting} />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject"><MessageSquare size={18} /> Assunto *</label>
                    <select id="subject" name="subject" value={formData.subject} onChange={handleChange} className={errors.subject ? 'error' : ''} disabled={isSubmitting}>
                      <option value="">Selecione um assunto</option>
                      <option value="Dúvida">Dúvida sobre produtos</option>
                      <option value="Encomenda">Encomenda especial</option>
                      <option value="Outro">Outro</option>
                    </select>
                    {errors.subject && <span className="field-error">{errors.subject}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Mensagem *</label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="6" className={errors.message ? 'error' : ''} disabled={isSubmitting} />
                  {errors.message && <span className="field-error">{errors.message}</span>}
                </div>
                
                <button type="submit" className="btn submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Conectando ao Java...' : <><Send size={18} /> Enviar Mensagem</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;