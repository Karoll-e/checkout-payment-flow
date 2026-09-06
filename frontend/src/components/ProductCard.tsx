import { useState } from 'react';
import type { ProductDto } from '../services/api';
import { VisaLogo, MastercardLogo } from './CardLogos';

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
          {product.price.toLocaleString('en-US', { style: 'currency', currency: 'COP' })}
        </p>
        <p className="product-card__stock">
          {outOfStock ? 'Out of stock' : `${product.stock} units available`}
        </p>

        {!outOfStock && (
          <>
            <div className="product-card__quantity">
              <button type="button" onClick={decrease} aria-label="Decrease quantity">
                −
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={increase} aria-label="Increase quantity">
                +
              </button>
            </div>

            <button
              type="button"
              className="product-card__buy-button"
              onClick={() => onBuy(product, quantity)}
            >
              <span className="product-card__buy-logos">
                <VisaLogo />
                <MastercardLogo />
              </span>
              <span className="product-card__buy-label">Pay with credit card</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}