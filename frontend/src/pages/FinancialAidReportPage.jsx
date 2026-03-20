import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.jsx';
import reportService from '../services/reportService.js';
import toast from 'react-hot-toast';

const PieChart = ({ slices, size = 160 }) => {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (!total) return null;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  let cumAngle = -Math.PI / 2;
  const paths = slices.map((sl, i) => {
    const angle = (sl.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    if (Math.abs(angle - 2 * Math.PI) < 0.0001) {
      return <circle key={i} cx={cx} cy={cy} r={r} fill={sl.color} />;
    }
    return (
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`}
        fill={sl.color}
      />
    );
  });
  return (
    <div className="flex flex-col items-center my-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{paths}</svg>
      <div className="flex gap-4 text-sm mt-2">
        {slices.map((sl, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: sl.color }} />
            {sl.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export const FinancialAidReportPage = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReport();
  }, [collegeId]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const result = await reportService.generateReport(collegeId);
      setReport(result.report);
    } catch (error) {
      toast.error('Failed to generate financial aid report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateReport = async () => {
    setGenerating(true);
    try {
      const result = await reportService.generateReport(collegeId, true);
      setReport(result.report);
      toast.success('Report regenerated successfully');
    } catch (error) {
      toast.error('Failed to regenerate report');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating financial aid analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-lg text-gray-600">Unable to generate report</p>
            <button
              onClick={() => navigate('/colleges')}
              className="btn btn-primary mt-4"
            >
              Back to Colleges
            </button>
          </div>
        </main>
      </div>
    );
  }

  const {
    college_name,
    estimated_tuition,
    estimated_room_board,
    estimated_total_cost,
    estimated_net_price,
    ai_analysis,
    recommendations,
    created_at,
    analysis_basis,
  } = report;

  // Compute demonstrated need and net price based on national average grant rates
  // by income bracket (College Board / NCES data). This reflects realistic aid
  // amounts students typically receive rather than the theoretical federal maximum.
  const computeFinancials = () => {
    if (!estimated_total_cost) return { demonstratedNeed: null, netPrice: estimated_net_price };

    let incomeRange = '';
    try {
      const basis = JSON.parse(analysis_basis || '{}');
      incomeRange = basis.income || '';
    } catch {}

    // Average grant rate (% of total cost covered) by income bracket.
    // Derived from national averages: College Board Trends in College Pricing,
    // NCES net price data. Lower income = higher grant coverage.
    const grantRates = {
      '$0 - $20,000':        0.70,
      '$20,001 - $40,000':   0.55,
      '$40,001 - $60,000':   0.38,
      '$60,001 - $80,000':   0.28,
      '$80,001 - $100,000':  0.18,
      '$100,001 - $150,000': 0.10,
      '$150,001 - $200,000': 0.05,
      '$200,000+':           0.02,
    };
    const grantRate = grantRates[incomeRange] ?? 0.28;

    const demonstratedNeed = Math.round(estimated_total_cost * grantRate);
    const netPrice = estimated_total_cost - demonstratedNeed;

    return { demonstratedNeed, netPrice };
  };

  const { demonstratedNeed, netPrice: computedNetPrice } = computeFinancials();
  const fmt = reportService.formatCurrency;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/colleges')}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Colleges
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {college_name}
          </h1>
          <p className="text-gray-600">
            Financial Aid Estimate & Analysis
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Generated {new Date(created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Cost of Attendance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Cost of Attendance
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tuition</span>
                <span className="font-semibold">{fmt(estimated_tuition)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Room & Board</span>
                <span className="font-semibold">{fmt(estimated_room_board)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-gray-900 font-semibold">Total Cost</span>
                <span className="text-lg font-bold text-gray-900">
                  {fmt(estimated_total_cost)}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Aid Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Financial Aid
            </h2>
            <div className="space-y-3">
              {estimated_total_cost && demonstratedNeed != null && (
                <PieChart
                  slices={[
                    { value: demonstratedNeed, color: '#22c55e', label: 'Grant Aid' },
                    { value: computedNetPrice, color: '#3b82f6', label: 'Out of Pocket' },
                  ]}
                />
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Demonstrated Need</span>
                <span className="font-semibold text-green-600">
                  {fmt(demonstratedNeed)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-gray-900 font-semibold">Net Price</span>
                <span className="text-lg font-bold text-blue-600">
                  {fmt(computedNetPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-8 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Key Insights
          </h2>
          <ul className="space-y-2">
            {ai_analysis?.key_insights?.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span className="text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recommendations
          </h2>
          <ul className="space-y-3">
            {recommendations?.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-amber-600 font-bold">→</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Raw Analysis */}
        {ai_analysis?.raw_analysis && (
          <div className="bg-gray-100 rounded-lg p-6 mb-8">
            <details className="cursor-pointer">
              <summary className="font-semibold text-gray-900 hover:text-blue-600">
                View Full AI Analysis
              </summary>
              <div className="mt-4 bg-white p-4 rounded text-gray-700 whitespace-pre-wrap text-sm">
                {ai_analysis.raw_analysis}
              </div>
            </details>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={regenerateReport}
            disabled={generating}
            className="btn btn-outline"
          >
            {generating ? 'Regenerating...' : 'Regenerate Report'}
          </button>
          <button
            onClick={() => navigate('/colleges')}
            className="btn btn-primary"
          >
            Compare with Other Colleges
          </button>
        </div>
      </main>
    </div>
  );
};
