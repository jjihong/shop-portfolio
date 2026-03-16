import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../config';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: {
    id: number;
    name: string;
  };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  useEffect(() => {
    fetch(`${API_URL}/api/products/${id}`)
      .then(res => res.json())
      .then(setProduct);
  }, [id]);

  if (!product) return <p>로딩 중...</p>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price.toLocaleString()}원</p>
      <p>재고: {product.stock}개</p>
      <p>카테고리: {product.category.name}</p>
    </div>
  );
}