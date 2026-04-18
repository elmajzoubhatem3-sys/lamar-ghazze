"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const categories = [
  {
    id: "pasta",
    name: "باستا",
    items: [
      {
        name: "باستا ألفريدو",
        price: "680,000 ل.ل",
        image: "/restaurant-bg.jpg",
      },
      {
        name: "باستا بستو",
        price: "640,000 ل.ل",
        image: "/restaurant-bg.jpg",
      },
      {
        name: "باستا أرابياتا",
        price: "610,000 ل.ل",
        image: "/restaurant-bg.jpg",
      },
      {
        name: "فيتوتشيني دجاج",
        price: "730,000 ل.ل",
        image: "/restaurant-bg.jpg",
      },
    ],
  },
  {
    id: "pizza",
    name: "بيتزا",
    items: [
      {
        name: "مارغريتا",
        price: "550,000 ل.ل",
        image: "/restaurant-bg.jpg",
      },
      {
        name: "خضار",
        price: "620,000 ل.ل",
        image: "/restaurant-bg.jpg",
      },
      {
        name: "4 أجبان",
        price: "700,000 ل.ل",
        image: "/restaurant-bg.jpg",
      },
      {
        name: "ببروني",
        price: "750,000 ل.ل",
        image: "/restaurant-bg.jpg",
      },
    ],
  },
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);

  const activeItems = useMemo(() => {
    return categories.find((c) => c.id === activeCategory)?.items || [];
  }, [activeCategory]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
        style={{ backgroundImage: "url('/restaurant-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 px-3 py-4">

        {/* HEADER */}
        <div className="sticky top-3 z-30 space-y-3">

          {/* restaurant name */}
          <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-2xl shadow-xl">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Lamar Ghazze</h1>

              <Link
                href="/"
                className="text-sm bg-white text-black px-4 py-2 rounded-full"
              >
                Home
              </Link>
            </div>
          </div>

          {/* categories bar */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-2 backdrop-blur-2xl">
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    activeCategory === cat.id
                      ? "bg-amber-300/20 text-amber-200"
                      : "bg-white/10"
                  } backdrop-blur-xl`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MENU SECTION */}
        <div className="mt-6">

          {/* CATEGORY TITLE (blur لحالو) */}
          <div className="mb-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/10">

              <div
                className="absolute inset-0 bg-cover bg-center blur-md scale-110"
                style={{ backgroundImage: "url('/restaurant-bg.jpg')" }}
              />

              <div className="absolute inset-0 bg-black/60" />

              <h2 className="relative z-10 px-5 py-4 text-2xl font-semibold">
                {categories.find(c => c.id === activeCategory)?.name}
              </h2>

            </div>
          </div>

          {/* GRID PRODUCTS */}
          <div className="grid grid-cols-2 gap-3">

            {activeItems.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl"
              >
                {/* IMAGE */}
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={item.image}
                    className="w-full h-40 object-cover"
                  />
                </div>

                {/* NAME + PRICE */}
                <div className="mt-2">
                  <h3 className="text-sm font-semibold">{item.name}</h3>
                  <p className="text-amber-200 text-sm">
                    {item.price}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </main>
  );
}