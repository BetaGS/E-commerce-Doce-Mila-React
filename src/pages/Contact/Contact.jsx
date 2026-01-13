import React, { useState } from 'react';
import './Contact.css';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageSquare, User, Loader2 } from 'lucide-react';

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
    } else if (formData.message.length < 5) {
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
      // 1. ENVIO PARA A API JAVA (RENDER)
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

      // 2. PREPARAÇÃO DA MENSAGEM WHATSAPP
      const msgWhatsapp = `*NOVO CONTATO* 🚀\n\n` +
                          `*Nome:* ${formData.name}\n` +
                          `*Email:* ${formData.email}\n` +
                          `*Assunto:* ${formData.subject}\n` +
                          `*Mensagem:* ${formData.message}`;
      
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msgWhatsapp)}`;

      // 3. REDIRECIONAMENTO INTELIGENTE (RESOLVE O PROBLEMA DO CELULAR)
      // Usamos um pequeno delay para garantir que o estado de "isSubmitting" seja processado
      setTimeout(() => {
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          // No Celular: window.location.replace ou assign funciona melhor que window.open
          window.location.assign(waUrl);
        } else {
          // No PC: Abre em nova aba
          window.open(waUrl, '_blank', 'noopener,noreferrer');
        }
      }, 100);

      // Feedback de Sucesso
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
      
    } catch (error) {
      console.error("Erro:", error);
      setErrors({ submit: 'O servidor demorou a responder. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <p>Nós vamos processar seu pedido e te redirecionar.</p>
              </div>
              
              {isSubmitted && (
                <div className="success-message">
                  <CheckCircle size={24} />
                  <div>
                    <h4>Enviado com sucesso!</h4>
                    <p>Abrindo seu WhatsApp...</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="contact-form">
                {errors.submit && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{errors.submit}</div>}
                
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
                      <option value="Reclamação">Reclamação</option>
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
                
                <button type="submit" className="btn submit-btn" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  {isSubmitting ? (
                    <>Aguarde um momento... <Loader2 className="animate-spin" size={18} /></>
                  ) : (
                    <><Send size={18} /> Enviar Mensagem</>
                  )}
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