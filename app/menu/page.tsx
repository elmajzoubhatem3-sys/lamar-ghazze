"use client";

import { useEffect, useState } from "react";

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
  description?: string;
  description_en?: string;
  price_lbp: number;
  image_url: string;
  category_id: number;
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

export default function MenuPage() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

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

        const sortedCategories = [...safeCategories].sort(
          (a, b) => Number(a.sort_order) - Number(b.sort_order)
        );

        const sortedProducts = [...safeProducts].sort(
          (a, b) => Number(a.sort_order) - Number(b.sort_order)
        );

        setSettings(settingsData);
        setCategories(sortedCategories);
        setProducts(sortedProducts);

        if (sortedCategories.length > 0) {
          setActiveCategoryId(Number(sortedCategories[0].id));
        }
      } catch (error) {
        console.error("Failed to load menu data:", error);
      }
    }

    loadData();
  }, []);

  let bannerUrls: string[] = [];

  try {
    bannerUrls = settings?.header_banner_urls
      ? JSON.parse(settings.header_banner_urls)
      : settings?.header_banner_url
      ? [settings.header_banner_url]
      : [];
  } catch {
    bannerUrls = [];
  }

  useEffect(() => {
    if (bannerUrls.length <= 1) return;

    const interval = setInterval(() => {
      setActiveBannerIndex((prev) =>
        prev === bannerUrls.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [bannerUrls.length]);

  const chooseLanguage = (lang: Language) => {
    localStorage.setItem("menu_language", lang);
    setLanguage(lang);
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

  const displayProductDescription = (product: Product) => {
    if (language === "en") return product.description_en || product.description || "";
    return product.description || "";
  };

  const scrollToCategory = (categoryId: number) => {
    setActiveCategoryId(categoryId);

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

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();

    if (!leadName.trim() || !leadPhone.trim()) {
      alert(language === "en" ? "Please enter your name and phone." : "رجاءً اكتب اسمك ورقمك.");
      return;
    }

    setLeadLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          phone: leadPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to submit");
        return;
      }

      setLeadSuccess(true);
      setLeadName("");
      setLeadPhone("");

      setTimeout(() => {
        setShowLeadModal(false);
        setLeadSuccess(false);
      }, 1600);
    } catch (error) {
      console.error(error);
      alert(language === "en" ? "Something went wrong." : "صار في خطأ.");
    } finally {
      setLeadLoading(false);
    }
  }

  const hasLanguage = language === "ar" || language === "en";

  const headerTitle = settings?.header_title || "Lamar Caffe";
  const headerSubtitle =
    language === "en"
      ? settings?.header_subtitle_en || settings?.header_subtitle || ""
      : settings?.header_subtitle || "";

  const offerText =
    language === "en"
      ? settings?.offers_text_en || "Get our latest offers"
      : settings?.offers_text || "استفد من عروضاتنا";

  const offersEnabled = settings?.offers_enabled !== false;

  return (
    <main dir={direction} className="relative min-h-screen overflow-hidden bg-black text-white">
      <div
        className="fixed inset-0 scale-110 bg-cover bg-center blur-sm"
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

      {hasLanguage && offersEnabled && (
        <button
          type="button"
          onClick={() => setShowLeadModal(true)}
          className="fixed left-3 top-0 z-40 flex flex-col items-center"
        >
          <div className="h-12 w-[2px] bg-amber-200/70 shadow-[0_0_12px_rgba(252,211,77,0.5)]" />
          <div className="-mt-1 rotate-[-4deg] rounded-2xl border border-amber-200/40 bg-amber-300 px-3 py-2 text-xs font-bold text-black shadow-2xl">
            {offerText}
          </div>
        </button>
      )}

      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 backdrop-blur-xl">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">
                  {language === "en" ? "Stay updated" : "خليك متابع عروضاتنا"}
                </h2>
                <p className="mt-1 text-sm text-neutral-300">
                  {language === "en"
                    ? "Enter your name and phone to receive our latest offers."
                    : "حط اسمك ورقمك ليضل يوصلك كل جديد."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLeadModal(false)}
                className="rounded-full bg-white/10 px-3 py-1 text-sm"
              >
                X
              </button>
            </div>

            {leadSuccess ? (
              <div className="mt-5 rounded-2xl bg-green-500/20 p-4 text-center text-green-100">
                {language === "en" ? "Thank you! Saved successfully." : "شكراً! تم حفظ معلوماتك."}
              </div>
            ) : (
              <form onSubmit={submitLead} className="mt-5 space-y-3">
                <input
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder={language === "en" ? "Your name" : "اسمك"}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                />

                <input
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder={language === "en" ? "Phone number" : "رقم الهاتف"}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                />

                <button
                  type="submit"
                  disabled={leadLoading}
                  className="w-full rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-black"
                >
                  {leadLoading
                    ? language === "en"
                      ? "Saving..."
                      : "عم نحفظ..."
                    : language === "en"
                    ? "Submit"
                    : "إرسال"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10 px-3 py-4 md:px-4">
        <header className="mb-3">
          {settings?.header_type === "banner" && bannerUrls.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-white/10 shadow-xl">
              <img
                src={bannerUrls[activeBannerIndex]}
                alt="Menu banner"
                className="h-40 w-full object-cover transition-all duration-700 md:h-60"
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 shadow-xl backdrop-blur-2xl">
              <h1 className="text-2xl font-semibold md:text-3xl">
                {headerTitle}
              </h1>
              {headerSubtitle && (
                <p className="mt-2 text-sm text-neutral-200 md:text-base">
                  {headerSubtitle}
                </p>
              )}
            </div>
          )}
        </header>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => scrollToCategory(Number(category.id))}
              className={`shrink-0 rounded-full px-4 py-2 text-sm backdrop-blur-xl transition ${
                activeCategoryId === Number(category.id)
                  ? "bg-amber-300 text-black shadow-[0_0_18px_rgba(252,211,77,0.45)]"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {displayCategoryName(category)}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {categories.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur-xl">
              {language === "en" ? "No categories yet" : "ما في كاتغوريز بعد"}
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
                      {language === "en"
                        ? "No products in this category yet"
                        : "ما في منتجات بهيدي الكاتغوري بعد"}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3">
                      {categoryProducts.map((item) => {
                        const description = displayProductDescription(item);

                        return (
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

                              {description && (
                                <p className="mt-1 text-xs leading-tight text-neutral-300 md:text-sm">
                                  {description}
                                </p>
                              )}

                              <p className="mt-1 text-sm leading-tight text-amber-200 md:text-base">
                                {Number(item.price_lbp).toLocaleString("en-US")} L.L
                              </p>
                            </div>
                          </div>
                        );
                      })}
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