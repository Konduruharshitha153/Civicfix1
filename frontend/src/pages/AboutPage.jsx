import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">
        About CivicFix
      </h1>

      <p className="text-slate-600 leading-relaxed mb-6">
        CivicFix is a civic issue reporting platform that helps citizens report
        local infrastructure and public service issues.
      </p>

      <Link
        to="/"
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        Back to Home
      </Link>
    </div>
  );
}