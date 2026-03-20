import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useEffect, useState } from 'react';

const FEATURES = [
  {
    title: 'AI-Powered Matching',
    desc: 'Our AI reads your profile and surfaces scholarships you actually qualify for — no more endless searching.',
  },
  {
    title: 'Auto Form Filling',
    desc: 'Stop re-typing the same information. GrantBridge auto-fills FAFSA and college aid forms using your saved profile.',
  },
  {
    title: 'Aid Package Estimates',
    desc: 'See realistic financial aid estimates from any college before you even apply, so you can plan with confidence.',
  },
  {
    title: 'Scholarship Swipe',
    desc: "Browse scholarships card by card. Save the ones you like and we'll track them for you automatically.",
  },
  {
    title: 'Fit Score',
    desc: 'Every college and scholarship gets a personalised fit score based on your academics, finances, and personal story.',
  },
  {
    title: 'Private & Secure',
    desc: 'Your financial information stays encrypted and is never sold. You control what gets shared and when.',
  },
];

const STEPS = [
  { num: '01', title: 'Build Your Profile', desc: 'Fill in your academics, finances, activities, and a little about yourself. It takes about 5 minutes.' },
  { num: '02', title: 'Get Matched', desc: 'Our AI scans thousands of scholarships and college programs to find the best fits for you.' },
  { num: '03', title: 'Apply with Ease', desc: 'Use pre-filled forms and tailored guidance to apply faster and with more confidence than ever before.' },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Navbar ────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <button
            onClick={() => navigate('/')}
            className="text-2xl font-extrabold tracking-tight text-blue-700"
          >
            GrantBridge
          </button>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary">
                Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="btn-secondary">
                  Sign In
                </button>
                <button onClick={() => navigate('/signup')} className="btn-primary">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-blue-700 text-white py-28 px-4">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-blue-500 rounded-full blur-2xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />

        <div
          className={`container text-center relative z-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 max-w-3xl mx-auto">
            Your Bridge to College
            <span className="block text-blue-200">Funding That Fits</span>
          </h1>

          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            GrantBridge uses AI to match you with scholarships, estimate your financial aid, and
            auto-fill forms — so you can focus on getting in, not the paperwork.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 rounded-xl bg-white text-blue-700 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 rounded-xl bg-white text-blue-700 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Get Started
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 rounded-xl border-2 border-blue-300 text-white font-semibold text-lg hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────── */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything You Need to Fund Your Future</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              One platform to find scholarships, understand your options, and apply — smarter.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-1 h-8 bg-blue-600 rounded-full mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Three steps from sign-up to your best application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-blue-100" />

            {STEPS.map((s) => (
              <div key={s.num} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-extrabold shadow-md mb-5 group-hover:scale-110 transition-transform duration-200 z-10">
                  {s.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────── */}
      <section className="py-20 px-4 bg-blue-700 text-white text-center">
        <div className="container max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4">Ready to find your funding?</h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of students navigating college costs with confidence.
          </p>
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-10 py-4 rounded-xl bg-white text-blue-700 font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate('/signup')}
              className="px-10 py-4 rounded-xl bg-white text-blue-700 font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Create Your Account
            </button>
          )}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <span className="text-xl font-extrabold text-blue-400">
            GrantBridge
          </span>
          <p>© {new Date().getFullYear()} GrantBridge. Built to make college accessible for everyone.</p>
          <div className="flex gap-6">
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Sign In</button>
            <button onClick={() => navigate('/signup')} className="hover:text-white transition-colors">Sign Up</button>
          </div>
        </div>
      </footer>

    </div>
  );
};
