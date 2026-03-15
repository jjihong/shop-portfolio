import { useEffect, useState, useCallback } from "react";

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const token = localStorage.getItem("token");

  const fetchCart = useCallback(() => {
    fetch("http://localhost:4000/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setItems);
  }, [token]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // 나머지 함수들 동일
  const updateQuantity = async (id: number, quantity: number) => {
    await fetch(`http://localhost:4000/api/cart/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });
    fetchCart();
  };

  const deleteItem = async (id: number) => {
    await fetch(`http://localhost:4000/api/cart/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCart();
  };

  const placeOrder = async () => {
    await fetch("http://localhost:4000/api/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("주문 완료");
    fetchCart();
  };

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );

  return (
    <div>
      <h1>장바구니</h1>
      {items.length === 0 ? (
        <p>장바구니가 비어있습니다.</p>
      ) : (
        <>
          {items.map((item) => (
            <div key={item.id}>
              <span>{item.product.name}</span>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
              />
              <span>{(item.product.price * item.quantity).toLocaleString()}원</span>
              <button onClick={() => deleteItem(item.id)}>삭제</button>
            </div>
          ))}
          <p>총 합계: {total.toLocaleString()}원</p>
          <button onClick={placeOrder}>주문하기</button>
        </>
      )}
    </div>
  );
}