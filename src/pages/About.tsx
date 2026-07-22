export default function About() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About PlaySprint</h1>

        <p className="text-slate-300 mb-6">
          PlaySprint is a browser-based platform that offers free interactive
          games, logic challenges, physics experiments, reaction tests, and
          creative mini experiences. Our goal is to provide fast, engaging, and
          educational entertainment that works instantly without downloads.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">Our Mission</h2>
        <p className="text-slate-300 mb-6">
          We believe web games should be simple, accessible, and enjoyable for
          everyone. PlaySprint is continuously expanding with new experiences
          designed for players around the world.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">What You Can Find</h2>

        <ul className="list-disc pl-6 text-slate-300 space-y-2">
          <li>Reaction and timing games</li>
          <li>Physics simulations</li>
          <li>Logic puzzles</li>
          <li>Creative browser experiments</li>
          <li>Completely free experiences</li>
        </ul>
      </div>
    </main>
  );
}
