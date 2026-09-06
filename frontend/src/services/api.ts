import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface TransactionDto {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  productId: string;
  quantity: number;
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
  totalAmount: number;
  wompiTransactionId?: string;
  errorMessage?: string;
}

export const productsApi = {
  getAll: () => api.get<ProductDto[]>('/products').then((r) => r.data),
  getById: (id: string) => api.get<ProductDto>(`/products/${id}`).then((r) => r.data),
};

export const transactionsApi = {
  create: (payload: {
    productId: string;
    quantity: number;
    customer: { name: string; email: string; phone: string };
    delivery: { address: string; city: string };
    deliveryFee: number;
  }) => api.post<TransactionDto>('/transactions', payload).then((r) => r.data),

  confirm: (transactionId: string, cardToken: string) =>
    api
      .post<TransactionDto>(`/transactions/${transactionId}/confirm`, { cardToken })
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<TransactionDto>(`/transactions/${id}`).then((r) => r.data),
};

export default api;