import { useState } from 'react';
import type { ProductDto } from '../services/api';

interface ProductCardProps {
  product: ProductDto;
  onBuy: (product: ProductDto, quantity: number) => void;
}

export default function ProductCard({ product, onBuy }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const outOfStock = product.stock === 0;

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => Math.min(product.stock, q + 1));

  return (
    <div className="product-card">
      {product.imageUrl && (
        <img src={product.imageUrl} alt={product.name} className="product-card__image" />
      )}
      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__description">{product.description}</p>
        <p className="product-card__price">
          {product.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
        </p>
        <p className="product-card__stock">
          {outOfStock ? 'Agotado' : `${product.stock} unidades disponibles`}
        </p>

        {!outOfStock && (
          <>
            <div className="product-card__quantity">
              <button type="button" onClick={decrease} aria-label="Disminuir cantidad">
                −
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={increase} aria-label="Aumentar cantidad">
                +
              </button>
            </div>

            <button
              type="button"
              className="product-card__buy-button"
              onClick={() => onBuy(product, quantity)}
            >
              Pagar con tarjeta
            </button>
          </>
        )}
      </div>
    </div>
  );
}