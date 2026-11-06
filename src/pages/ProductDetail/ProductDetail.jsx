import React from 'react'
import { useParams } from 'react'
import { formatCurrency } from '../../utils/format'

const ProductDetail = () => {
  const { id } = useParams()
  
  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
      <h2>Detalhes do Produto #{id}</h2>
      <p style={{ marginTop: '10px' }}>Descrição detalhada do doce selecionado...</p>
      <h3 style={{ marginTop: '15px', color: '#d87093' }}>{formatCurrency(35.00)}</h3>
      <button style={{ marginTop: '20px', padding: '10px 20px', background: '#ffb6c1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
        Adicionar ao Carrinho
      </button>
    </div>
  )
}

export default ProductDetail