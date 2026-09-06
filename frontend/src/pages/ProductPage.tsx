import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi, type ProductDto } from '../services/api';
import { useAppDispatch } from '../app/hooks';
import { selectProduct } from '../features/checkout/checkoutSlice';
import ProductCard from '../components/ProductCard';
import './ProductPage.css';

export default function ProductPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    productsApi
      .getAll()
      .then(setProducts)
      .catch(() => setError('No se pudieron cargar los productos. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = (product: ProductDto, quantity: number) => {
    dispatch(
      selectProduct({
        product: { id: product.id, name: product.name, price: product.price },
        quantity,
      }),
    );
    navigate('/checkout');
  };

  if (loading) return <p className="product-page__status">Cargando productos...</p>;
  if (error) return <p className="product-page__status product-page__status--error">{error}</p>;

  return (
    <div className="product-page">
      <h1 className="product-page__title">Nuestros productos</h1>
      <div className="product-page__grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onBuy={handleBuy} />
        ))}
      </div>
    </div>
  );
}