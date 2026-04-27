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
  offers_enabled?: boolean;
  offers_text?: string;
  offers_text_en?: string;
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

  const [offersEnabled, setOffersEnabled] = useState(true);
  const [offersText, setOffersText] = useState("استفد من عروضاتنا");
  const [offersTextEn, setOffersTextEn] = useState("Get our latest offers");

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

      setOffersEnabled(settingsData.offers_enabled !== false);
      setOffersText(settingsData.offers_text || "استفد من عروضاتنا");
      setOffersTextEn(settingsData.offers_text_en || "Get our latest offers");

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

  async function handleCategoryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || String(active.id) === String(over.id)) return;

    const oldIndex = categories.findIndex(
      (cat) => String(cat.id) === String(active.id)
    );

    const newIndex = categories.findIndex(
      (cat) => String(cat.id) === String(over.id)
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const newCategories = arrayMove(categories, oldIndex, newIndex).map(
      (cat, index) => ({
        ...cat,
        sort_order: index,
      })
    );

    setCategories(newCategories);

    const res = await fetch("/api/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: newCategories }),
    });

    if (!res.ok) {
      alert("Failed to save category order");
      await loadData();
      return;
    }

    await loadData();
  }

  async function handleProductDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || String(active.id) === String(over.id)) return;

    const oldIndex = products.findIndex(
      (product) => String(product.id) === String(active.id)
    );

    const newIndex = products.findIndex(
      (product) => String(product.id) === String(over.id)
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const newProducts = arrayMove(products, oldIndex, newIndex).map(
      (product, index) => ({
        ...product,
        sort_order: index,
      })
    );

    setProducts(newProducts);

    const res = await fetch("/api/products/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: newProducts }),
    });

    if (!res.ok) {
      alert("Failed to save product order");
      await loadData();
      return;
    }

    await loadData();
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
          offers_enabled: offersEnabled,
          offers_text: offersText,
          offers_text_en: offersTextEn,
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

        {/* HEADER SETTINGS */}
        <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-2xl">
          <h2 className="text-xl font-semibold">Header Settings</h2>

          <div className="mt-4 space-y-3">
            <select
              value={headerType}
              onChange={(e) => setHeaderType(e.target.value as "text" | "banner")}
              className="w-full rounded-2xl bg-black/30 px-4 py-3"
            >
              <option value="text">Text</option>
              <option value="banner">Banner</option>
            </select>

            <input
              value={headerTitle}
              onChange={(e) => setHeaderTitle(e.target.value)}
              placeholder="Title"
              className="w-full rounded-2xl bg-black/30 px-4 py-3"
            />

            <input
              value={headerSubtitle}
              onChange={(e) => setHeaderSubtitle(e.target.value)}
              placeholder="Arabic subtitle"
              className="w-full rounded-2xl bg-black/30 px-4 py-3"
            />

            <input
              value={headerSubtitleEn}
              onChange={(e) => setHeaderSubtitleEn(e.target.value)}
              placeholder="English subtitle"
              className="w-full rounded-2xl bg-black/30 px-4 py-3"
            />

            <input
              type="file"
              multiple
              onChange={(e) =>
                setHeaderBannerFiles(Array.from(e.target.files || []))
              }
              className="w-full rounded-2xl bg-black/30 px-4 py-3"
            />

            <button
              onClick={saveSettings}
              className="w-full rounded-2xl bg-white px-4 py-3 text-black"
            >
              Save Header
            </button>
          </div>
        </div>

        {/* OFFERS SETTINGS */}
        <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-2xl">
          <h2 className="text-xl font-semibold">Offers Popup</h2>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={offersEnabled}
                onChange={(e) => setOffersEnabled(e.target.checked)}
              />
              Enable Offers Popup
            </label>

            <input
              value={offersText}
              onChange={(e) => setOffersText(e.target.value)}
              placeholder="Arabic text"
              className="w-full rounded-2xl bg-black/30 px-4 py-3"
            />

            <input
              value={offersTextEn}
              onChange={(e) => setOffersTextEn(e.target.value)}
              placeholder="English text"
              className="w-full rounded-2xl bg-black/30 px-4 py-3"
            />

            <button
              onClick={saveSettings}
              className="w-full rounded-2xl bg-amber-300 px-4 py-3 text-black"
            >
              Save Offers Settings
            </button>
          </div>
        </div>

        {/* DRAG CATEGORIES */}
        <div>
          <h2 className="mb-3 text-xl font-semibold">Categories</h2>

          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleCategoryDragEnd}
          >
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {categories.map((cat) => (
                  <SortableItem key={cat.id} id={cat.id}>
                    <div className="rounded-xl bg-white/10 p-3">
                      {cat.name} / {cat.name_en}
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* DRAG PRODUCTS */}
        <div>
          <h2 className="mb-3 text-xl font-semibold">Products</h2>

          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleProductDragEnd}
          >
            <SortableContext
              items={products.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {products.map((p) => (
                  <SortableItem key={p.id} id={p.id}>
                    <div className="rounded-xl bg-white/10 p-3">
                      {p.name}
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

      </div>
    </main>
  );
}