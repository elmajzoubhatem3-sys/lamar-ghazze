"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/products", { cache: "no-store" }),
        ]);

        const catData = await catRes.json();
        const prodData = await prodRes.json();

        const safeCategories = Array.isArray(catData) ? catData : [];
        const safeProducts = Array.isArray(prodData) ? prodData : [];

        const sortedCategories = [...safeCategories].sort(
          (a, b) => Number(a.sort_order) - Number(b.sort_order)
        );

        setCategories(sortedCategories);
        setProducts(safeProducts);
      } catch (error) {
        console.error("Failed to load menu data:", error);
      }
    }

    loadData();
  }, []);

  const scrollToCategory = (categoryId: number) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const yOffset = -170;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
        style={{ backgroundImage: "url('/restaurant-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 px-3 py-4 md:px-4">
        <div className="sticky top-3 z-40 mb-6">
          <div className="space-y-3 rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-2xl shadow-xl">
            <div>
              <h1 className="text-2xl font-semibold md:text-3xl">
                Lamar Caffe
              </h1>
              <p className="mt-2 text-sm text-neutral-200 md:text-base">
                Fresh meals, beautiful presentation, and a premium dining vibe.
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => scrollToCategory(Number(category.id))}
                  className="shrink-0 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-xl transition hover:bg-white/20"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {categories.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur-xl">
              No categories yet
            </div>
          ) : (
            categories.map((category) => {
              const categoryProducts = products.filter(
                (product) => Number(product.category_id) === Number(category.id)
              );

              return (
                <section
                  key={category.id}
                  id={`category-${category.id}`}
                  className="rounded-3xl border border-white/10 bg-white/10 p-3 backdrop-blur-2xl shadow-xl md:p-4"
                >
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">{category.name}</h2>
                  </div>

                  {categoryProducts.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-sm text-neutral-300">
                      No products in this category yet
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3">
                      {categoryProducts.map((item) => (
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
                              <div className="flex aspect-square items-center justify-center text-sm text-neutral-400">
                                No Image
                              </div>
                            </div>
                          )}

                          <div className="mt-2">
                            <h3 className="text-sm font-semibold leading-tight md:text-base">
                              {item.name}
                            </h3>
                            <p className="text-sm leading-tight text-amber-200 md:text-base">
                              {Number(item.price_lbp).toLocaleString("en-US")} L.L
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}