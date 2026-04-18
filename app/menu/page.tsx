"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
  sort_order: number;
};

type Product = {
  id: number;
  name: string;
  price_lbp: number;
  image_url: string;
  category_id: number;
};

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
        ]);

        const catData = await catRes.json();
        const prodData = await prodRes.json();

        const safeCategories = Array.isArray(catData) ? catData : [];
        const safeProducts = Array.isArray(prodData) ? prodData : [];

        setCategories(safeCategories);
        setProducts(safeProducts);

        if (safeCategories.length > 0) {
          setActiveCategory(Number(safeCategories[0].id));
        }
      } catch (error) {
        console.error("Failed to load menu data:", error);
      }
    }

    loadData();
  }, []);

  const activeCategoryName = useMemo(() => {
    return categories.find((c) => Number(c.id) === activeCategory)?.name || "";
  }, [categories, activeCategory]);

  const activeItems = useMemo(() => {
    return products.filter((item) => Number(item.category_id) === activeCategory);
  }, [products, activeCategory]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
        style={{ backgroundImage: "url('/restaurant-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 px-3 py-4">
        <div className="sticky top-3 z-30 space-y-3">
          <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Lamar Ghazze</h1>

              <Link
                href="/"
                className="rounded-full bg-white px-4 py-2 text-sm text-black"
              >
                Home
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-2 backdrop-blur-2xl">
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(Number(cat.id))}
                  className={`rounded-full px-4 py-2 text-sm backdrop-blur-xl ${
                    Number(activeCategory) === Number(cat.id)
                      ? "bg-amber-300/20 text-amber-200"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              <div
                className="absolute inset-0 scale-110 bg-cover bg-center blur-md"
                style={{ backgroundImage: "url('/restaurant-bg.jpg')" }}
              />
              <div className="absolute inset-0 bg-black/60" />

              <h2 className="relative z-10 px-5 py-4 text-2xl font-semibold">
                {activeCategoryName || "Menu"}
              </h2>
            </div>
          </div>

          {activeItems.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur-xl">
              No products yet
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-5">
              {activeItems.map((item) => (
                <div key={item.id}>
                  {item.image_url ? (
                    <div className="overflow-hidden rounded-2xl border border-white/10">
                      <div className="aspect-square">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      <div className="aspect-square flex items-center justify-center text-sm text-neutral-400">
                        No Image
                      </div>
                    </div>
                  )}

                  <div className="mt-2">
                    <h3 className="text-sm font-semibold leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-sm text-amber-200 leading-tight">
                      {Number(item.price_lbp).toLocaleString("en-US")} ل.ل
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}