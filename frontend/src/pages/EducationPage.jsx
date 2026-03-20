import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.jsx';
import { BookOpen, Sparkles, Target, GraduationCap, ArrowRight } from 'lucide-react';
import { educationArticles, quickWins } from '../data/educationArticles.js';

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

export const EducationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container py-10">
        <section className="mb-8">
          <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white p-8 shadow-lg">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3 md:max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4" />
                  Education Hub
                </div>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                  In-depth guides on FAFSA, grants, loans, ROTC, jobs, scholarships, and choosing the right school.
                </h1>
                <p className="text-blue-100 text-sm md:text-base">
                  Everything here is written for you: clear, specific, and actionable so you can pay less, borrow smarter, and stand out.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-50 mb-2">
                  <Target className="h-4 w-4" /> Quick wins
                </div>
                <ul className="space-y-2 text-sm text-blue-50/90 list-disc list-inside">
                  {quickWins.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {educationArticles.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => navigate(`/education/${article.id}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25 transition"
                >
                  <BookOpen className="h-4 w-4" />
                  {article.title}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">Article library</p>
              <h2 className="text-xl font-bold text-gray-900">Tap a tile to open the full guide</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {educationArticles.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => navigate(`/education/${article.id}`)}
                className="group h-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">{article.kicker}</p>
                    <h3 className="text-lg font-bold text-gray-900">{article.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.summary}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span>{formatDate(article.date)}</span>
                  <span>{article.readingTime}</span>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                  Read article
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-dashed border-blue-200 bg-white p-5 shadow-sm flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-blue-700" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bookmark and reuse</h3>
            <p className="text-sm text-gray-600">
              Save this hub and tap any tile to dive into full guides. Pull lines, stats, and action steps into your FAFSA prep, scholarship essays, appeals, and budgeting plan.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};
