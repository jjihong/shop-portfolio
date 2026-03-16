import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    fetch(`${API_URL}/api/products?${params}`)
      .then(res => res.json())
      .then(setProducts);
  }, [searchParams]);

  return (
    <div>
      <input
        placeholder="검색"
        onChange={e => setSearchParams({ search: e.target.value })}
      />
      <div>
        {products.map((p: Product) => (
          <div key={p.id}>
            <h3>{p.name}</h3>
            <p>{p.price.toLocaleString()}원</p>
          </div>
        ))}
      </div>
    </div>
  );
}