"use client";

import { useEffect, useMemo, useState } from "react";

type Language = "ar" | "en";

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
  sort_order: number;
};

type Settings = {
  header_type: "text" | "banner";
  header_title: string;
  header_subtitle: string;
  header_banner_url: string;
};

export default function MenuPage() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("menu_language") as Language | null;
    if (savedLanguage === "ar" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }

    async function loadData() {
      try {
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
      } catch (error) {
        console.error("Failed to load menu data:", error);
      }
    }

    loadData();
  }, []);

  const chooseLanguage = (lang: Language) => {
    localStorage.setItem("menu_language", lang);
    setLanguage(lang);
  };

  const t = {
    choose: language === "en" ? "Choose menu language" : "اختار لغة المنيو",
    arabic: "العربية",
    english: "English",
    noCategories: language === "en" ? "No categories yet" : "ما في كاتغوريز بعد",
    noProducts:
      language === "en"
        ? "No products in this category yet"
        : "ما في منتجات بهيدي الكاتغوري بعد",
  };

  const direction = language === "ar" ? "rtl" : "ltr";

  const displayCategoryName = (category: Category) => {
    if (language === "en") return category.name_en || category.name;
    return category.name;
  };

  const displayProductName = (product: Product) => {
    if (language === "en") return product.name_en || product.name;
    return product.name;
  };

  const scrollToCategory = (categoryId: number) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const yOffset = -20;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  };

  const hasLanguage = language === "ar" || language === "en";

  const headerTitle = settings?.header_title || "Lamar Caffe";
  const headerSubtitle =
    settings?.header_subtitle ||
    "Fresh meals, beautiful presentation, and a premium dining vibe.";

  return (
    <main dir={direction} className="relative min-h-screen overflow-hidden bg-black text-white">
      <div
        className="fixed inset-0 bg-cover bg-center scale-110 blur-md"
        style={{ backgroundImage: "url('/restaurant-bg.jpg')" }}
      />
      <div className="fixed inset-0 bg-black/70" />

      {!hasLanguage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-xl">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-2xl">
            <h1 className="text-2xl font-semibold">Lamar Caffe</h1>
            <p className="mt-3 text-neutral-200">Choose menu language</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => chooseLanguage("ar")}
                className="rounded-2xl bg-white px-4 py-3 font-medium text-black"
              >
                العربية
              </button>
              <button
                onClick={() => chooseLanguage("en")}
                className="rounded-2xl bg-white/10 px-4 py-3 font-medium text-white"
              >
                English
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 px-3 py-4 md:px-4">
        <header className="mb-3">
          {settings?.header_type === "banner" && settings.header_banner_url ? (
            <div className="overflow-hidden rounded-3xl border border-white/10 shadow-xl">
              <img
                src={settings.header_banner_url}
                alt="Menu banner"
                className="h-40 w-full object-cover md:h-60"
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 shadow-xl backdrop-blur-2xl">
              <h1 className="text-2xl font-semibold md:text-3xl">
                {headerTitle}
              </h1>
              <p className="mt-2 text-sm text-neutral-200 md:text-base">
                {headerSubtitle}
              </p>
            </div>
          )}
        </header>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => scrollToCategory(Number(category.id))}
              className="shrink-0 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-xl transition hover:bg-white/20"
            >
              {displayCategoryName(category)}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {categories.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur-xl">
              {t.noCategories}
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
                  className="rounded-3xl border border-white/10 bg-white/10 p-3 shadow-xl backdrop-blur-2xl md:p-4"
                >
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">
                      {displayCategoryName(category)}
                    </h2>
                  </div>

                  {categoryProducts.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-sm text-neutral-300">
                      {t.noProducts}
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
                                  alt={displayProductName(item)}
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
                              {displayProductName(item)}
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

        {hasLanguage && (
          <button
            onClick={() => {
              localStorage.removeItem("menu_language");
              setLanguage(null);
            }}
            className="fixed bottom-4 right-4 z-40 rounded-full bg-white px-4 py-2 text-xs font-medium text-black shadow-xl"
          >
            {language === "en" ? "Language" : "اللغة"}
          </button>
        )}
      </div>
    </main>
  );
}