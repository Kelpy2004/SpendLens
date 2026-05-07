export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#111827]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#4f46e5]">
            SpendLens
          </p>
          <h1 className="text-5xl font-semibold leading-tight tracking-normal text-[#0f172a] sm:text-6xl">
            AI spend audits for teams that move fast.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#475569]">
            The foundation is ready. Next up: a focused intake flow for AI tool
            subscriptions, seats, and monthly spend.
          </p>
        </div>
      </section>
    </main>
  );
}
