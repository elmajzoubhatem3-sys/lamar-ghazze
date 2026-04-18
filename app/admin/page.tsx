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
  category_name?: string;
};

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [categoryName, setCategoryName] = useState("");
  const [categorySort, setCategorySort] = useState("0");

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);

  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  async function loadData() {
    const [catRes, prodRes] = await Promise.all([
      fetch("/api/categories"),
      fetch("/api/products"),
    ]);

    const catData = await catRes.json();
    const prodData = await prodRes.json();

    setCategories(Array.isArray(catData) ? catData : []);
    setProducts(Array.isArray(prodData) ? prodData : []);

    if (Array.isArray(catData) && catData.length > 0 && !productCategory) {
      setProductCategory(String(catData[0].id));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    setLoadingCategory(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryName,
          sort_order: Number(categorySort || 0),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add category");
        return;
      }

      setCategoryName("");
      setCategorySort("0");
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while adding category");
    } finally {
      setLoadingCategory(false);
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoadingProduct(true);

    try {
      let image_url = "";

      if (productImageFile) {
        const formData = new FormData();
        formData.append("file", productImageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          alert(uploadData.error || "Image upload failed");
          return;
        }

        image_url = uploadData.url;
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: Number(productCategory),
          name: productName,
          price_lbp: Number(productPrice),
          image_url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add product");
        return;
      }

      setProductName("");
      setProductPrice("");
      setProductImageFile(null);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while adding product");
    } finally {
      setLoadingProduct(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <p className="text-[11px] uppercase tracking-[0.35em] text-amber-300/80">
            Admin Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Lamar Ghazze Admin</h1>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleAddCategory}
            className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl"
          >
            <h2 className="text-xl font-semibold">Add Category</h2>

            <div className="mt-4 space-y-3">
              <input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category name"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              />

              <input
                value={categorySort}
                onChange={(e) => setCategorySort(e.target.value)}
                type="number"
                placeholder="Sort order"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              />

              <button
                type="submit"
                disabled={loadingCategory}
                className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black"
              >
                {loadingCategory ? "Adding..." : "Add Category"}
              </button>
            </div>
          </form>

          <form
            onSubmit={handleAddProduct}
            className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl"
          >
            <h2 className="text-xl font-semibold">Add Product</h2>

            <div className="mt-4 space-y-3">
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Product name"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              />

              <input
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                type="number"
                placeholder="Price in LBP"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              />

              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              >
                <option value="">Choose category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProductImageFile(e.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              />

              <button
                type="submit"
                disabled={loadingProduct}
                className="w-full rounded-2xl bg-amber-300 px-4 py-3 font-medium text-black"
              >
                {loadingProduct ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-xl font-semibold">Categories</h2>
            <div className="mt-4 space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                >
                  {cat.name}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-xl font-semibold">Products</h2>
            <div className="mt-4 space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3"
                >
                  <img
                    src={product.image_url || "/restaurant-bg.jpg"}
                    alt={product.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-neutral-300">
                      {product.price_lbp.toLocaleString("en-US")} ل.ل
                    </p>
                    <p className="text-xs text-amber-200">
                      {product.category_name || "No category"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}