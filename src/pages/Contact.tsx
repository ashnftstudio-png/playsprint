export default function Contact() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-8">Contact PlaySprint</h1>

        <p className="text-xl text-slate-400 mb-8">
          We'd love to hear your feedback, suggestions, bug reports, and partnership
          inquiries. PlaySprint is constantly improving, and your ideas help us
          build a better experience for everyone.
        </p>

        <h2 className="text-3xl font-semibold mt-10 mb-4">
          Contact Information
        </h2>

        <p className="text-lg text-slate-400 mb-6">
          Email:
          <br />
          contact@playsprint.fun
        </p>

        <h2 className="text-3xl font-semibold mt-10 mb-4">
          What You Can Contact Us About
        </h2>

        <ul className="list-disc pl-8 text-lg text-slate-400 space-y-3">
          <li>Bug reports</li>
          <li>Game suggestions</li>
          <li>Partnership opportunities</li>
          <li>Advertising inquiries</li>
          <li>General feedback</li>
        </ul>
      </div>
    </main>
  );
}
