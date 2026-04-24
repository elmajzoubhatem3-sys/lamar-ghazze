"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  description?: string;
  description_en?: string;
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
  header_subtitle_en?: string;
  header_banner_url: string;
  header_banner_urls?: string;
};

function SortableItem({
  id,
  children,
}: {
  id: number;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-xl bg-white/10 px-3 text-lg active:cursor-grabbing"
          title="Drag"
        >
          ≡
        </button>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [categoryName, setCategoryName] = useState("");
  const [categoryNameEn, setCategoryNameEn] = useState("");

  const [productName, setProductName] = useState("");
  const [productNameEn, setProductNameEn] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productDescriptionEn, setProductDescriptionEn] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);

  const [headerType, setHeaderType] = useState<"text" | "banner">("text");
  const [headerTitle, setHeaderTitle] = useState("Lamar Caffe");
  const [headerSubtitle, setHeaderSubtitle] = useState("");
  const [headerSubtitleEn, setHeaderSubtitleEn] = useState("");
  const [headerBannerFiles, setHeaderBannerFiles] = useState<File[]>([]);
  const [headerBannerUrls, setHeaderBannerUrls] = useState<string[]>([]);

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategoryNameEn, setEditingCategoryNameEn] = useState("");

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingProductName, setEditingProductName] = useState("");
  const [editingProductNameEn, setEditingProductNameEn] = useState("");
  const [editingProductDescription, setEditingProductDescription] =
    useState("");
  const [editingProductDescriptionEn, setEditingProductDescriptionEn] =
    useState("");
  const [editingProductPrice, setEditingProductPrice] = useState("");
  const [editingProductCategory, setEditingProductCategory] = useState("");
  const [editingProductImageFile, setEditingProductImageFile] =
    useState<File | null>(null);

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

    const settingsData: Settings | null = await settingsRes.json();
    const catData = await catRes.json();
    const prodData = await prodRes.json();

    const safeCategories = Array.isArray(catData) ? catData : [];
    const safeProducts = Array.isArray(prodData) ? prodData : [];

    setCategories(
      [...safeCategories].sort(
        (a, b) => Number(a.sort_order) - Number(b.sort_order)
      )
    );

    setProducts(
      [...safeProducts].sort(
        (a, b) => Number(a.sort_order) - Number(b.sort_order)
      )
    );

    if (settingsData) {
      setHeaderType(settingsData.header_type || "text");
      setHeaderTitle(settingsData.header_title || "Lamar Caffe");
      setHeaderSubtitle(settingsData.header_subtitle || "");
      setHeaderSubtitleEn(settingsData.header_subtitle_en || "");

      try {
        setHeaderBannerUrls(
          settingsData.header_banner_urls
            ? JSON.parse(settingsData.header_banner_urls)
            : settingsData.header_banner_url
            ? [settingsData.header_banner_url]
            : []
        );
      } catch {
        setHeaderBannerUrls([]);
      }
    }

    if (safeCategories.length > 0 && !productCategory) {
      setProductCategory(String(safeCategories[0].id));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveCategoryOrder(newCategories: Category[]) {
    await fetch("/api/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: newCategories }),
    });
  }

  async function saveProductOrder(newProducts: Product[]) {
    await fetch("/api/products/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: newProducts }),
    });
  }

  async function handleCategoryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);

    const newCategories = arrayMove(categories, oldIndex, newIndex).map(
      (cat, index) => ({ ...cat, sort_order: index })
    );

    setCategories(newCategories);
    await saveCategoryOrder(newCategories);
  }

  async function handleProductDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((product) => product.id === active.id);
    const newIndex = products.findIndex((product) => product.id === over.id);

    const newProducts = arrayMove(products, oldIndex, newIndex).map(
      (product, index) => ({ ...product, sort_order: index })
    );

    setProducts(newProducts);
    await saveProductOrder(newProducts);
  }

  async function saveSettings() {
    try {
      let urls = [...headerBannerUrls];

      if (headerBannerFiles.length > 0) {
        const uploadedUrls: string[] = [];

        for (const file of headerBannerFiles) {
          const uploadedUrl = await uploadFile(file);
          uploadedUrls.push(uploadedUrl);
        }

        urls = [...urls, ...uploadedUrls];
      }

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          header_type: headerType,
          header_title: headerTitle,
          header_subtitle: headerSubtitle,
          header_subtitle_en: headerSubtitleEn,
          header_banner_url: urls[0] || "",
          header_banner_urls: JSON.stringify(urls),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save settings");
        return;
      }

      setHeaderBannerFiles([]);
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
        sort_order: categories.length,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to add category");
      return;
    }

    setCategoryName("");
    setCategoryNameEn("");
    await loadData();
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();

    try {
      let image_url = "";

      if (productImageFile) {
        image_url = await uploadFile(productImageFile);
      }

      const productCountInCategory = products.filter(
        (product) => Number(product.category_id) === Number(productCategory)
      ).length;

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: Number(productCategory),
          name: productName,
          name_en: productNameEn,
          description: productDescription,
          description_en: productDescriptionEn,
          price_lbp: Number(productPrice),
          image_url,
          sort_order: productCountInCategory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add product");
        return;
      }

      setProductName("");
      setProductNameEn("");
      setProductDescription("");
      setProductDescriptionEn("");
      setProductPrice("");
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
  }

  async function saveEditCategory() {
    if (!editingCategoryId) return;

    const currentCategory = categories.find(
      (cat) => cat.id === editingCategoryId
    );

    const res = await fetch(`/api/categories/${editingCategoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editingCategoryName,
        name_en: editingCategoryNameEn,
        sort_order: currentCategory?.sort_order ?? 0,
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
    setEditingProductDescription(product.description || "");
    setEditingProductDescriptionEn(product.description_en || "");
    setEditingProductPrice(String(product.price_lbp));
    setEditingProductCategory(String(product.category_id));
    setEditingProductImageFile(null);
  }

  async function saveEditProduct() {
    if (!editingProductId) return;

    try {
      let image_url: string | undefined = undefined;

      if (editingProductImageFile) {
        image_url = await uploadFile(editingProductImageFile);
      }

      const currentProduct = products.find(
        (product) => product.id === editingProductId
      );

      const res = await fetch(`/api/products/${editingProductId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingProductName,
          name_en: editingProductNameEn,
          description: editingProductDescription,
          description_en: editingProductDescriptionEn,
          price_lbp: Number(editingProductPrice),
          category_id: Number(editingProductCategory),
          sort_order: currentProduct?.sort_order ?? 0,
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
              <option value="banner">Banner Images</option>
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
              placeholder="Arabic header subtitle"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
            />

            <input
              value={headerSubtitleEn}
              onChange={(e) => setHeaderSubtitleEn(e.target.value)}
              placeholder="English header subtitle"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
            />

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setHeaderBannerFiles(Array.from(e.target.files || []))}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
            />

            {headerBannerUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {headerBannerUrls.map((url, index) => (
                  <div key={url} className="relative">
                    <img
                      src={url}
                      alt="Header banner"
                      className="h-28 w-full rounded-2xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setHeaderBannerUrls(headerBannerUrls.filter((_, i) => i !== index))
                      }
                      className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
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
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Arabic product description"
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              />
              <textarea
                value={productDescriptionEn}
                onChange={(e) => setProductDescriptionEn(e.target.value)}
                placeholder="English product description"
                rows={3}
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
              <button className="w-full rounded-2xl bg-amber-300 px-4 py-3 font-medium text-black">
                Add Product
              </button>
            </div>
          </form>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-xl font-semibold">Categories</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Drag the ≡ button to reorder categories.
            </p>

            <div className="mt-4 space-y-3">
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleCategoryDragEnd}
              >
                <SortableContext
                  items={categories.map((cat) => cat.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {categories.map((cat) => (
                      <SortableItem key={cat.id} id={cat.id}>
                        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                          {editingCategoryId === cat.id ? (
                            <div className="space-y-3">
                              <input
                                value={editingCategoryName}
                                onChange={(e) =>
                                  setEditingCategoryName(e.target.value)
                                }
                                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                              />
                              <input
                                value={editingCategoryNameEn}
                                onChange={(e) =>
                                  setEditingCategoryNameEn(e.target.value)
                                }
                                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={saveEditCategory}
                                  className="rounded-xl bg-amber-300 px-4 py-2 text-black"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCategoryId(null)}
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
                                <p className="text-sm text-neutral-300">
                                  {cat.name_en || "No English name"}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditCategory(cat)}
                                  className="rounded-xl bg-white/10 px-3 py-2 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteCategory(cat.id)}
                                  className="rounded-xl bg-red-500/20 px-3 py-2 text-sm text-red-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-xl font-semibold">Products</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Drag the ≡ button to reorder products.
            </p>

            <div className="mt-4">
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleProductDragEnd}
              >
                <SortableContext
                  items={products.map((product) => product.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {products.map((product) => (
                      <SortableItem key={product.id} id={product.id}>
                        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                          {editingProductId === product.id ? (
                            <div className="space-y-3">
                              <input
                                value={editingProductName}
                                onChange={(e) =>
                                  setEditingProductName(e.target.value)
                                }
                                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                              />
                              <input
                                value={editingProductNameEn}
                                onChange={(e) =>
                                  setEditingProductNameEn(e.target.value)
                                }
                                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                              />
                              <textarea
                                value={editingProductDescription}
                                onChange={(e) =>
                                  setEditingProductDescription(e.target.value)
                                }
                                rows={3}
                                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                              />
                              <textarea
                                value={editingProductDescriptionEn}
                                onChange={(e) =>
                                  setEditingProductDescriptionEn(e.target.value)
                                }
                                rows={3}
                                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                              />
                              <input
                                value={editingProductPrice}
                                onChange={(e) =>
                                  setEditingProductPrice(e.target.value)
                                }
                                type="number"
                                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                              />
                              <select
                                value={editingProductCategory}
                                onChange={(e) =>
                                  setEditingProductCategory(e.target.value)
                                }
                                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                              >
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
                                  setEditingProductImageFile(
                                    e.target.files?.[0] || null
                                  )
                                }
                                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={saveEditProduct}
                                  className="rounded-xl bg-amber-300 px-4 py-2 text-black"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingProductId(null)}
                                  className="rounded-xl bg-white/10 px-4 py-2"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
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
                                  {product.name_en || "No English name"}
                                </p>
                                {product.description && (
                                  <p className="text-xs text-neutral-400">
                                    {product.description}
                                  </p>
                                )}
                                {product.description_en && (
                                  <p className="text-xs text-neutral-500">
                                    {product.description_en}
                                  </p>
                                )}
                                <p className="text-sm text-amber-200">
                                  {Number(product.price_lbp).toLocaleString(
                                    "en-US"
                                  )}{" "}
                                  L.L
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditProduct(product)}
                                  className="rounded-xl bg-white/10 px-3 py-2 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteProduct(product.id)}
                                  className="rounded-xl bg-red-500/20 px-3 py-2 text-sm text-red-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}