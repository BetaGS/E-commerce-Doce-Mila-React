import React from 'react'
import { Link } from 'react-router-dom'

const Cart = () => {
  return (
    <div>
      <h2>Seu Carrinho</h2>
      <p style={{ margin: '20px 0' }}>Seu carrinho está vazio no momento.</p>
      <Link to="/produtos" style={{ color: '#d87093', fontWeight: 'bold' }}>Voltar para a loja</Link>
    </div>
  )
}

export default Cart