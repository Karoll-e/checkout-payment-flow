import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi, type ProductDto } from '../services/api';
import { useAppDispatch } from '../app/hooks';
import { selectProduct, setCustomerAndDelivery } from '../features/checkout/checkoutSlice';
import ProductHero from '../components/ProductHero';
import PaymentModal from '../components/PaymentModal';
import './ProductPage.css';

export default function ProductPage() {
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    productsApi
      .getAll()
      .then((products) => setProduct(products[0] ?? null))
      .catch(() => setError('Could not load the product. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = (_product: ProductDto, quantity: number) => {
    setCheckoutQuantity(quantity);
    setIsModalOpen(true);
  };

  const handleConfirm = (payload: {
    customer: { name: string; email: string; phone: string };
    delivery: { address: string; city: string };
    cardToken: string;
  }) => {
    if (!product) return;

    dispatch(
      selectProduct({
        product: { id: product.id, name: product.name, price: product.price },
        quantity: checkoutQuantity,
      }),
    );
    dispatch(
      setCustomerAndDelivery({
        customer: payload.customer,
        delivery: payload.delivery,
      }),
    );

    setIsModalOpen(false);
    navigate('/summary', { state: { cardToken: payload.cardToken } });
  };

  if (loading) return <p className="product-page__status">Loading product...</p>;
  if (error) return <p className="product-page__status product-page__status--error">{error}</p>;
  if (!product)
    return <p className="product-page__status">There is no product available right now.</p>;

  return (
    <>
      <ProductHero product={product} onBuy={handleBuy} />
      {isModalOpen && (
        <PaymentModal
          isOpen={isModalOpen}
          product={product}
          quantity={checkoutQuantity}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}

