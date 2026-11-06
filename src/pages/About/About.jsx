// src/pages/About/About.jsx
import React from 'react';
import './About.css';
import { Users, Heart, Award, Coffee, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Camila Vilar',
      role: 'Fundadora e Chef Confeiteira',
      bio: 'Formada em Gastronomia com especialização em Confeitaria Francesa. Mais de 10 anos de experiência criando doces que encantam.',
      image: '/images/CamilaVilar.png'
    },
    {
      id: 2,
      name: 'Michael Peter',
      role: 'Decorador Master',
      bio: 'Artista plástico que encontrou nas confeitarias sua verdadeira paixão. Cria decorações que são verdadeiras obras de arte.',
      image: '/images/MichaelPeter.png'
    },
    {
      id: 3,
      name: 'Kika Silva',
      role: 'Ajudante Confeitaria',
      bio: 'Especialista em doces tradicionais com um toque moderno. Responsável por garantir que cada doce saia perfeito da cozinha.',
      image: '/images/KikaSilva.png'
    },
   
  ];

  const values = [
    {
      icon: <Heart size={32} />,
      title: 'Paixão',
      description: 'Cada doce é feito com amor e dedicação. Acreditamos que a paixão é o ingrediente secreto que faz a diferença.'
    },
    {
      icon: <Award size={32} />,
      title: 'Qualidade',
      description: 'Usamos apenas ingredientes premium e seguimos rigorosos padrões de qualidade em todas as etapas.'
    },
    {
      icon: <Coffee size={32} />,
      title: 'Criatividade',
      description: 'Estamos sempre inovando, criando novas receitas e apresentações que surpreendem nossos clientes.'
    },
    {
      icon: <Users size={32} />,
      title: 'Comunidade',
      description: 'Acreditamos no poder dos doces para unir pessoas e criar momentos especiais de convivência.'
    }
  ];

  const milestones = [
    { year: '2015', event: 'Fundação da Doce Mila em uma pequena cozinha' },
    { year: '2017', event: 'Primeira loja física e expansão da equipe' },
    { year: '2019', event: 'Prêmio "Melhor Confeitaria Artesanal" da cidade' },
    { year: '2020', event: 'Lançamento do e-commerce e entrega delivery' },
    { year: '2022', event: 'Expansão para outras cidades e 10.000 clientes atendidos' },
    { year: '2023', event: 'Certificação de ingredientes orgânicos e sustentáveis' }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1 className="about-title">Nossa História de Amor pelos Doces</h1>
            <p className="about-subtitle">
              Desde 2015, transformamos ingredientes simples em experiências memoráveis
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="our-story">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2 className="section-title">Do Sonho à Realidade</h2>
              <p>
                A docemila foiiniciada em 2015,
onde fazia parte de uma barraquinha
de feira,no Largo do Machado.
levando doces artesanais aos nossos
clientes . Assim fomos crescendo,
estudando e aqueles doces que eram
preparados na cozinha de casa
ganhou um novo espaço, novas
técnicas e uma cartela enorme de
clientes .
assim seguimos ano a ano, levando
nossos doces para festas , eventos ,
comemoraçoes e etc...
Criando memorias especiais e
inesqueciveis aos nossos clientes.
              </p>
            </div>
            <div className="story-image">
              <img src="/images/Fotodeperfil.png" alt="confeiteiros" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="our-values">
        <div className="container">
          <h2 className="section-title">Nossos Valores</h2>
          <p className="section-subtitle">
            Princípios que guiam cada doce que criamos
          </p>
          
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">
                  {value.icon}
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="our-team">
        <div className="container">
          <h2 className="section-title">Conheça Nossa Equipe</h2>
          <p className="section-subtitle">
            Profissionais apaixonados que tornam a magia possível
          </p>
          
          <div className="team-grid">
            {teamMembers.map(member => (
              <div key={member.id} className="team-card">
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <span className="team-role">{member.role}</span>
                  <p>{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    

      {/* Quality Commitment */}
      <section className="quality-commitment">
        <div className="container">
          <div className="quality-content">
            <div className="quality-text">
              <h2 className="section-title">Compromisso com a Qualidade</h2>
              <p>
                Na Doce Mila, qualidade não é apenas uma palavra - é nossa promessa. 
                Trabalhamos apenas com fornecedores certificados, ingredientes frescos 
                e técnicas artesanais que preservam o sabor e a textura.
              </p>
              <ul className="quality-list">
                <li>
                  <Star size={20} />
                  <span>Ingredientes 100% naturais, sem conservantes artificiais</span>
                </li>
                <li>
                  <Star size={20} />
                  <span>Fornecedores locais sempre que possível</span>
                </li>
                <li>
                  <Star size={20} />
                  <span>Processos sustentáveis e eco-friendly</span>
                </li>
                <li>
                  <Star size={20} />
                  <span>Rigoroso controle de qualidade em todas as etapas</span>
                </li>
              </ul>
            </div>
            <div className="quality-image">
              <img 
                src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Ingredientes frescos" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Pronto para Experimentar Nossos Doces?</h2>
            <p>
              Cada mordida conta uma história de paixão, qualidade e dedicação. 
              Experimente a diferença Doce Mila.
            </p>
            <div className="cta-buttons">
                <Link to="/produtos" className="btn btn-primary">Ver Produtos</Link>    
              <Link to="/contato" className="btn btn-secondary">Fale Conosco</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;