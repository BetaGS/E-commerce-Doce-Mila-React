import React from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/format'
import './ProductCard.css'

const ProductCard = ({ product }) => {
  const imageSrc = product?.image?.startsWith('/') 
    ? product.image 
    : `/images/produtos/${product?.image || 'placeholder.png'}`

  return (
    <div className="product-card">
      <img src={imageSrc} alt={product?.name || 'Produto'} className="product-image" />
      <div className="product-info">
        <h3>{product?.name || 'Doce Artesanal'}</h3>
        <p className="product-price">{formatCurrency(product?.price || 0)}</p>
        <Link to={`/produto/${product?.id || 1}`} className="btn-details">
          Ver Detalhes
        </Link>
      </div>
    </div>
  )
}

export default ProductCard