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

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategorySort, setEditingCategorySort] = useState("0");

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingProductName, setEditingProductName] = useState("");
  const [editingProductPrice, setEditingProductPrice] = useState("");
  const [editingProductCategory, setEditingProductCategory] = useState("");
  const [editingProductImageFile, setEditingProductImageFile] = useState<File | null>(null);

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

      setCategories(safeCategories);
      setProducts(safeProducts);

      if (safeCategories.length > 0 && !productCategory) {
        setProductCategory(String(safeCategories[0].id));
      }
    } catch (error) {
      console.error("loadData error:", error);
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
        try {
          const formData = new FormData();
          formData.append("file", productImageFile);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            image_url = uploadData.url || "";
          } else {
            console.error("Upload failed, continuing without image");
          }
        } catch (uploadError) {
          console.error("Upload error, continuing without image:", uploadError);
        }
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

  async function handleDeleteCategory(id: number) {
    const hasProducts = products.some((p) => Number(p.category_id) === Number(id));

    if (hasProducts) {
      alert("You cannot delete a category that still has products.");
      return;
    }

    const confirmed = confirm("Delete this category?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete category");
        return;
      }

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while deleting category");
    }
  }

  function startEditCategory(category: Category) {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setEditingCategorySort(String(category.sort_order ?? 0));
  }

  function cancelEditCategory() {
    setEditingCategoryId(null);
    setEditingCategoryName("");
    setEditingCategorySort("0");
  }

  async function saveEditCategory() {
    if (!editingCategoryId) return;

    try {
      const res = await fetch(`/api/categories/${editingCategoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingCategoryName,
          sort_order: Number(editingCategorySort || 0),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update category");
        return;
      }

      cancelEditCategory();
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while updating category");
    }
  }

  async function handleDeleteProduct(id: number) {
    const confirmed = confirm("Delete this product?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete product");
        return;
      }

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while deleting product");
    }
  }

  function startEditProduct(product: Product) {
    setEditingProductId(product.id);
    setEditingProductName(product.name);
    setEditingProductPrice(String(product.price_lbp));
    setEditingProductCategory(String(product.category_id));
    setEditingProductImageFile(null);
  }

  function cancelEditProduct() {
    setEditingProductId(null);
    setEditingProductName("");
    setEditingProductPrice("");
    setEditingProductCategory("");
    setEditingProductImageFile(null);
  }

  async function saveEditProduct() {
    if (!editingProductId) return;

    try {
      let image_url: string | undefined = undefined;

      if (editingProductImageFile) {
        try {
          const formData = new FormData();
          formData.append("file", editingProductImageFile);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            image_url = uploadData.url || "";
          }
        } catch (uploadError) {
          console.error("Edit upload error:", uploadError);
        }
      }

      const res = await fetch(`/api/products/${editingProductId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingProductName,
          price_lbp: Number(editingProductPrice),
          category_id: Number(editingProductCategory),
          image_url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update product");
        return;
      }

      cancelEditProduct();
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while updating product");
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
                  className="rounded-2xl border border-white/10 bg-black/25 p-4"
                >
                  {editingCategoryId === cat.id ? (
                    <div className="space-y-3">
                      <input
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                      />
                      <input
                        value={editingCategorySort}
                        onChange={(e) => setEditingCategorySort(e.target.value)}
                        type="number"
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEditCategory}
                          className="rounded-xl bg-amber-300 px-4 py-2 text-black"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditCategory}
                          className="rounded-xl bg-white/10 px-4 py-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-xs text-neutral-400">
                          Sort: {cat.sort_order}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditCategory(cat)}
                          className="rounded-xl bg-white/10 px-3 py-2 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="rounded-xl bg-red-500/20 px-3 py-2 text-sm text-red-200"
                        >
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
                <div
                  key={product.id}
                  className="rounded-2xl border border-white/10 bg-black/25 p-4"
                >
                  {editingProductId === product.id ? (
                    <div className="space-y-3">
                      <input
                        value={editingProductName}
                        onChange={(e) => setEditingProductName(e.target.value)}
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
                        onChange={(e) =>
                          setEditingProductImageFile(e.target.files?.[0] || null)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={saveEditProduct}
                          className="rounded-xl bg-amber-300 px-4 py-2 text-black"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditProduct}
                          className="rounded-xl bg-white/10 px-4 py-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/5 text-xs text-neutral-400">
                          No Image
                        </div>
                      )}

                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-neutral-300">
                          {Number(product.price_lbp).toLocaleString("en-US")} ل.ل
                        </p>
                        <p className="text-xs text-amber-200">
                          {product.category_name || "No category"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditProduct(product)}
                          className="rounded-xl bg-white/10 px-3 py-2 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="rounded-xl bg-red-500/20 px-3 py-2 text-sm text-red-200"
                        >
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