export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-7xl font-bold mb-6">404</h1>

        <h2 className="text-3xl font-semibold mb-4">
          Page Not Found
        </h2>

        <p className="text-slate-400 mb-8">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>

        <a
          href="/"
          className="inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500 transition"
        >
          Back to PlaySprint
        </a>
      </div>
    </div>
  );
}
