import { useState } from 'react';
import type { ProductDto } from '../services/api';
import { VisaLogo, MastercardLogo } from './CardLogos';
import gameboyImage from '../assets/nintendo-image.png';
import gameboyImageWebp from '../assets/nintendo-image.webp';
import './ProductHero.css';

interface ProductHeroProps {
  product: ProductDto;
  onBuy: (product: ProductDto, quantity: number) => void;
}

export default function ProductHero({ product, onBuy }: ProductHeroProps) {
  const [quantity, setQuantity] = useState(1);
  const outOfStock = product.stock === 0;

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => Math.min(product.stock, q + 1));

  return (
    <section className="product-hero">
      <picture className="product-hero__image product-hero__image--mobile">
        <source srcSet={gameboyImageWebp} type="image/webp" />
        <img
          src={gameboyImage}
          alt={product.name}
          loading="eager"
          width={220}
          height={228}
        />
      </picture>

      <div className="product-hero__content">
        <p className="product-hero__eyebrow">The new...</p>
        <h1 className="product-hero__brand">Nintendo</h1>

        <h2 className="product-hero__name">{product.name}</h2>
        <p className="product-hero__tagline">Keep it in your pants.</p>
        <p className="product-hero__price">
          {product.price.toLocaleString('en-US', { style: 'currency', currency: 'COP' })}
        </p>

        {!outOfStock && (
          <div className="product-hero__actions">
            <button
              type="button"
              className="product-hero__buy-button"
              onClick={() => onBuy(product, quantity)}
            >
              <span className="product-hero__buy-logos">
                <VisaLogo />
                <MastercardLogo />
              </span>
              <span className="product-hero__buy-label">Pay with credit card</span>
            </button>

            <div className="product-hero__quantity">
              <button type="button" onClick={decrease} aria-label="Decrease quantity">
                −
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={increase} aria-label="Increase quantity">
                +
              </button>
            </div>
          </div>
        )}

        <p className="product-hero__stock">
          <span
            className={`product-hero__stock-dot${
              outOfStock ? ' product-hero__stock-dot--empty' : ''
            }`}
          />
          {outOfStock ? 'Out of stock' : `${product.stock} units available`}
        </p>
      </div>

      <picture className="product-hero__image product-hero__image--desktop">
        <source srcSet={gameboyImageWebp} type="image/webp" />
        <img
          src={gameboyImage}
          alt={product.name}
          loading="eager"
          width={380}
          height={394}
        />
      </picture>

      <p className="product-hero__footer">
        <span className="product-hero__globe" aria-hidden="true">
          &#127760;
        </span>
        Play more anywhere
      </p>
    </section>
  );
}
