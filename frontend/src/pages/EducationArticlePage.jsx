import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.jsx';
import { ArrowLeft, BookOpen, ListChecks, Calendar, Clock } from 'lucide-react';
import { educationArticles } from '../data/educationArticles.js';

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

export const EducationArticlePage = () => {
  const navigate = useNavigate();
  const { articleId } = useParams();

  const article = useMemo(
    () => educationArticles.find((entry) => entry.id === articleId),
    [articleId]
  );

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container py-10">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-start gap-3">
              <BookOpen className="h-6 w-6 text-blue-700" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Article not found</h1>
                <p className="text-sm text-gray-600 mt-1">The article you are looking for is unavailable.</p>
                <button
                  type="button"
                  onClick={() => navigate('/education')}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Education Hub
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container py-10">
        <button
          type="button"
          onClick={() => navigate('/education')}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Education Hub
        </button>

        <section className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white p-8 shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 md:max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                <BookOpen className="h-4 w-4" />
                {article.kicker}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">{article.title}</h1>
              <p className="text-blue-100 text-sm md:text-base">{article.summary}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur min-w-[220px] space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-50">
                <Calendar className="h-4 w-4" /> {formatDate(article.date)}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-50">
                <Clock className="h-4 w-4" /> {article.readingTime}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-6">
          {article.sections.map((section) => (
            <article
              key={section.heading}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{section.heading}</h2>
              <div className="space-y-3">
                {section.body.map((paragraph, idx) => (
                  <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl bg-blue-50 border border-blue-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 mb-3">
            <ListChecks className="h-4 w-4" /> Action steps
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-900">
            {article.actionSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};
