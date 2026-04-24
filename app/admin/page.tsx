"use client";

import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  name_en?: string;
  sort_order: number;
};

type Product = {
  id: number;
  name: string;
  name_en?: string;
  price_lbp: number;
  image_url: string;
  category_id: number;
  category_name?: string;
  sort_order: number;
};

type Settings = {
  header_type: "text" | "banner";
  header_title: string;
  header_subtitle: string;
  header_banner_url: string;
};

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [categoryNameEn, setCategoryNameEn] = useState("");
  const [categorySort, setCategorySort] = useState("0");

  const [productName, setProductName] = useState("");
  const [productNameEn, setProductNameEn] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productSort, setProductSort] = useState("0");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategoryNameEn, setEditingCategoryNameEn] = useState("");
  const [editingCategorySort, setEditingCategorySort] = useState("0");

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingProductName, setEditingProductName] = useState("");
  const [editingProductNameEn, setEditingProductNameEn] = useState("");
  const [editingProductPrice, setEditingProductPrice] = useState("");
  const [editingProductCategory, setEditingProductCategory] = useState("");
  const [editingProductSort, setEditingProductSort] = useState("0");
  const [editingProductImageFile, setEditingProductImageFile] = useState<File | null>(null);

  const [headerType, setHeaderType] = useState<"text" | "banner">("text");
  const [headerTitle, setHeaderTitle] = useState("Lamar Caffe");
  const [headerSubtitle, setHeaderSubtitle] = useState(
    "Fresh meals, beautiful presentation, and a premium dining vibe."
  );
  const [headerBannerFile, setHeaderBannerFile] = useState<File | null>(null);
  const [headerBannerUrl, setHeaderBannerUrl] = useState("");

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      throw new Error(uploadData.error || "Upload failed");
    }

    return uploadData.url || "";
  }

  async function loadData() {
    const [settingsRes, catRes, prodRes] = await Promise.all([
      fetch("/api/settings", { cache: "no-store" }),
      fetch("/api/categories", { cache: "no-store" }),
      fetch("/api/products", { cache: "no-store" }),
    ]);

    const settingsData = await settingsRes.json();
    const catData = await catRes.json();
    const prodData = await prodRes.json();

    const safeCategories = Array.isArray(catData) ? catData : [];
    const safeProducts = Array.isArray(prodData) ? prodData : [];

    setSettings(settingsData);
    setCategories(safeCategories);
    setProducts(safeProducts);

    if (settingsData) {
      setHeaderType(settingsData.header_type || "text");
      setHeaderTitle(settingsData.header_title || "Lamar Caffe");
      setHeaderSubtitle(
        settingsData.header_subtitle ||
          "Fresh meals, beautiful presentation, and a premium dining vibe."
      );
      setHeaderBannerUrl(settingsData.header_banner_url || "");
    }

    if (safeCategories.length > 0 && !productCategory) {
      setProductCategory(String(safeCategories[0].id));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveSettings() {
    try {
      let bannerUrl = headerBannerUrl;

      if (headerBannerFile) {
        bannerUrl = await uploadFile(headerBannerFile);
      }

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          header_type: headerType,
          header_title: headerTitle,
          header_subtitle: headerSubtitle,
          header_banner_url: bannerUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save settings");
        return;
      }

      setHeaderBannerFile(null);
      await loadData();
      alert("Settings saved");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save settings");
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: categoryName,
        name_en: categoryNameEn,
        sort_order: Number(categorySort || 0),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to add category");
      return;
    }

    setCategoryName("");
    setCategoryNameEn("");
    setCategorySort("0");
    await loadData();
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();

    try {
      let image_url = "";

      if (productImageFile) {
        image_url = await uploadFile(productImageFile);
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: Number(productCategory),
          name: productName,
          name_en: productNameEn,
          price_lbp: Number(productPrice),
          image_url,
          sort_order: Number(productSort || 0),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add product");
        return;
      }

      setProductName("");
      setProductNameEn("");
      setProductPrice("");
      setProductSort("0");
      setProductImageFile(null);
      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add product");
    }
  }

  function startEditCategory(category: Category) {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setEditingCategoryNameEn(category.name_en || "");
    setEditingCategorySort(String(category.sort_order || 0));
  }

  async function saveEditCategory() {
    if (!editingCategoryId) return;

    const res = await fetch(`/api/categories/${editingCategoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editingCategoryName,
        name_en: editingCategoryNameEn,
        sort_order: Number(editingCategorySort || 0),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to update category");
      return;
    }

    setEditingCategoryId(null);
    await loadData();
  }

  async function deleteCategory(id: number) {
    if (!confirm("Delete this category?")) return;

    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete category");
      return;
    }

    await loadData();
  }

  function startEditProduct(product: Product) {
    setEditingProductId(product.id);
    setEditingProductName(product.name);
    setEditingProductNameEn(product.name_en || "");
    setEditingProductPrice(String(product.price_lbp));
    setEditingProductCategory(String(product.category_id));
    setEditingProductSort(String(product.sort_order || 0));
    setEditingProductImageFile(null);
  }

  async function saveEditProduct() {
    if (!editingProductId) return;

    try {
      let image_url: string | undefined = undefined;

      if (editingProductImageFile) {
        image_url = await uploadFile(editingProductImageFile);
      }

      const res = await fetch(`/api/products/${editingProductId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingProductName,
          name_en: editingProductNameEn,
          price_lbp: Number(editingProductPrice),
          category_id: Number(editingProductCategory),
          sort_order: Number(editingProductSort || 0),
          image_url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update product");
        return;
      }

      setEditingProductId(null);
      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update product");
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm("Delete this product?")) return;

    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete product");
      return;
    }

    await loadData();
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <p className="text-[11px] uppercase tracking-[0.35em] text-amber-300/80">
            Admin Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Lamar Caffe Admin</h1>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <h2 className="text-xl font-semibold">Header Settings</h2>

          <div className="mt-4 space-y-3">
            <select
              value={headerType}
              onChange={(e) => setHeaderType(e.target.value as "text" | "banner")}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
            >
              <option value="text">Text Header</option>
              <option value="banner">Banner Image</option>
            </select>

            <input
              value={headerTitle}
              onChange={(e) => setHeaderTitle(e.target.value)}
              placeholder="Header title"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
            />

            <input
              value={headerSubtitle}
              onChange={(e) => setHeaderSubtitle(e.target.value)}
              placeholder="Header subtitle"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setHeaderBannerFile(e.target.files?.[0] || null)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
            />

            {headerBannerUrl && (
              <img
                src={headerBannerUrl}
                alt="Header banner"
                className="h-32 w-full rounded-2xl object-cover"
              />
            )}

            <button
              onClick={saveSettings}
              className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black"
            >
              Save Header Settings
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleAddCategory}
            className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl"
          >
            <h2 className="text-xl font-semibold">Add Category</h2>

            <div className="mt-4 space-y-3">
              <input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Arabic category name"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              />
              <input
                value={categoryNameEn}
                onChange={(e) => setCategoryNameEn(e.target.value)}
                placeholder="English category name"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              />
              <input
                value={categorySort}
                onChange={(e) => setCategorySort(e.target.value)}
                type="number"
                placeholder="Sort order"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              />
              <button className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black">
                Add Category
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
                placeholder="Arabic product name"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              />
              <input
                value={productNameEn}
                onChange={(e) => setProductNameEn(e.target.value)}
                placeholder="English product name"
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
                value={productSort}
                onChange={(e) => setProductSort(e.target.value)}
                type="number"
                placeholder="Sort order"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProductImageFile(e.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              />
              <button className="w-full rounded-2xl bg-amber-300 px-4 py-3 font-medium text-black">
                Add Product
              </button>
            </div>
          </form>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-xl font-semibold">Categories</h2>

            <div className="mt-4 space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  {editingCategoryId === cat.id ? (
                    <div className="space-y-3">
                      <input
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                      />
                      <input
                        value={editingCategoryNameEn}
                        onChange={(e) => setEditingCategoryNameEn(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                      />
                      <input
                        value={editingCategorySort}
                        onChange={(e) => setEditingCategorySort(e.target.value)}
                        type="number"
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={saveEditCategory} className="rounded-xl bg-amber-300 px-4 py-2 text-black">
                          Save
                        </button>
                        <button onClick={() => setEditingCategoryId(null)} className="rounded-xl bg-white/10 px-4 py-2">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-sm text-neutral-300">{cat.name_en || "No English name"}</p>
                        <p className="text-xs text-neutral-400">Sort: {cat.sort_order}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEditCategory(cat)} className="rounded-xl bg-white/10 px-3 py-2 text-sm">
                          Edit
                        </button>
                        <button onClick={() => deleteCategory(cat.id)} className="rounded-xl bg-red-500/20 px-3 py-2 text-sm text-red-200">
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-xl font-semibold">Products</h2>

            <div className="mt-4 space-y-3">
              {products.map((product) => (
                <div key={product.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  {editingProductId === product.id ? (
                    <div className="space-y-3">
                      <input
                        value={editingProductName}
                        onChange={(e) => setEditingProductName(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                      />
                      <input
                        value={editingProductNameEn}
                        onChange={(e) => setEditingProductNameEn(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                      />
                      <input
                        value={editingProductPrice}
                        onChange={(e) => setEditingProductPrice(e.target.value)}
                        type="number"
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                      />
                      <select
                        value={editingProductCategory}
                        onChange={(e) => setEditingProductCategory(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <input
                        value={editingProductSort}
                        onChange={(e) => setEditingProductSort(e.target.value)}
                        type="number"
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditingProductImageFile(e.target.files?.[0] || null)}
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={saveEditProduct} className="rounded-xl bg-amber-300 px-4 py-2 text-black">
                          Save
                        </button>
                        <button onClick={() => setEditingProductId(null)} className="rounded-xl bg-white/10 px-4 py-2">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/5 text-xs text-neutral-400">
                          No Image
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-neutral-300">{product.name_en || "No English name"}</p>
                        <p className="text-sm text-amber-200">{Number(product.price_lbp).toLocaleString("en-US")} L.L</p>
                        <p className="text-xs text-neutral-400">Sort: {product.sort_order}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEditProduct(product)} className="rounded-xl bg-white/10 px-3 py-2 text-sm">
                          Edit
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="rounded-xl bg-red-500/20 px-3 py-2 text-sm text-red-200">
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}