import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  categoryId: number;
  imageUrl: string | null;
  description: string | null;
}

export default function AdminProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    name: "", price: "", stock: "", categoryId: "", imageUrl: "", description: "",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchProducts = () => {
    fetch("http://localhost:4000/api/products")
      .then((res) => res.json())
      .then(setProducts);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async () => {
    const url = editId
      ? `http://localhost:4000/api/admin/products/${editId}`
      : "http://localhost:4000/api/admin/products";

    await fetch(url, {
      method: editId ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: Number(form.categoryId),
      }),
    });

    setForm({ name: "", price: "", stock: "", categoryId: "", imageUrl: "", description: "" });
    setEditId(null);
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      categoryId: String(product.categoryId),
      imageUrl: product.imageUrl ?? "",
      description: product.description ?? "",
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch(`http://localhost:4000/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
  };

  return (
    <div>
      <h1>상품 관리</h1>
      <button onClick={() => navigate("/admin/orders")}>주문 관리로 이동</button>

      <h2>{editId ? "상품 수정" : "상품 등록"}</h2>
      {(["name", "price", "stock", "categoryId", "imageUrl", "description"] as const).map((field) => (
        <input
          key={field}
          placeholder={field}
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        />
      ))}
      <button onClick={handleSubmit}>{editId ? "수정" : "등록"}</button>
      {editId && <button onClick={() => { setEditId(null); setForm({ name: "", price: "", stock: "", categoryId: "", imageUrl: "", description: "" }); }}>취소</button>}

      <h2>상품 목록</h2>
      {products.map((p) => (
        <div key={p.id}>
          <span>{p.name} / {p.price.toLocaleString()}원 / 재고 {p.stock}</span>
          <button onClick={() => handleEdit(p)}>수정</button>
          <button onClick={() => handleDelete(p.id)}>삭제</button>
        </div>
      ))}
    </div>
  );
}