export default function HomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 text-white">
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-sm"
        style={{ backgroundImage: "url('/restaurant-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/75" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-7 text-center shadow-2xl backdrop-blur-2xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4A017]/90 text-3xl text-[#1f1600] shadow-xl">
          🔒
        </div>

        <h1 className="text-2xl font-semibold">Menu is currently closed</h1>

        <p className="mt-3 text-sm leading-6 text-neutral-200">
          The menu is temporarily unavailable.
          <br />
          Please contact the restaurant.
        </p>

        <div className="mt-6 rounded-2xl border border-[#D4A017]/40 bg-[#D4A017]/10 px-4 py-3 text-sm text-[#f4d27a]">
          Lamar Caffe
        </div>
      </div>
    </main>
  );
}