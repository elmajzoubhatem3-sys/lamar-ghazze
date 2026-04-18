import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
        style={{ backgroundImage: "url('/restaurant-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="max-w-3xl rounded-[36px] border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-2xl md:p-12">
          <p className="mb-4 text-xs uppercase tracking-[0.45em] text-amber-300/80">
            Luxury Dining Experience
          </p>

          <h1 className="text-5xl font-semibold md:text-7xl">Lamar Ghazze</h1>

          <p className="mt-6 text-lg text-neutral-200">
            Premium QR menu with elegant glass blur design.
          </p>

          <Link
            href="/menu"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition hover:scale-105"
          >
            View Menu
          </Link>
        </div>
      </div>
    </main>
  );
}