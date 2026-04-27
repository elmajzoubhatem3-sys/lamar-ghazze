"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  name_en?: string;
  price_lbp: number;
  image_url: string;
};

type Settings = {
  ordering_enabled?: boolean;
};

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [prodRes, settingsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/settings"),
      ]);

      setProducts(await prodRes.json());
      setSettings(await settingsRes.json());
    }

    loadData();
  }, []);

  function addToCart(product: Product) {
    const existing = cart.find((p) => p.id === product.id);

    if (existing) {
      setCart(
        cart.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  }

  async function sendOrder() {
    await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cart.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price_lbp: item.price_lbp,
        })),
      }),
    });

    setCart([]);
    setShowCart(false);
    alert("Order sent");
  }

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl mb-4">Menu</h1>

      <div className="grid grid-cols-2 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white/10 p-3 rounded-xl">
            <img src={p.image_url} className="w-full h-32 object-cover" />
            <p className="mt-2">{p.name}</p>
            <p>{p.price_lbp} L.L</p>

            {settings?.ordering_enabled && (
              <button
                onClick={() => addToCart(p)}
                className="mt-2 w-full bg-amber-300 text-black py-2 rounded-xl"
              >
                Order
              </button>
            )}
          </div>
        ))}
      </div>

      {settings?.ordering_enabled && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-4 right-4 bg-green-500 px-4 py-3 rounded-full"
        >
          Cart ({cart.length})
        </button>
      )}

      {showCart && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-white text-black p-5 rounded-xl w-[90%] max-w-md">
            <h2 className="text-xl mb-3">Cart</h2>

            {cart.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>{item.price_lbp * item.quantity}</span>
              </div>
            ))}

            <button
              onClick={sendOrder}
              className="mt-4 w-full bg-black text-white py-2 rounded-xl"
            >
              Send Order
            </button>

            <button
              onClick={() => setShowCart(false)}
              className="mt-2 w-full border py-2 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}