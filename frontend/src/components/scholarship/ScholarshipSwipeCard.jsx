export const ScholarshipSwipeCard = ({ scholarship }) => {
  if (!scholarship) return null;

  const seedFromString = (value) => {
    const input = String(value || 'default-scholarship-seed');
    let hash = 2166136261;

    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  };

  const createRng = (seed) => {
    let state = seed || 1;

    return () => {
      state |= 0;
      state = (state + 0x6D2B79F5) | 0;
      let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
      mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed);
      return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
  };

  const sampleFitPercent = (seedText) => {
    const random = createRng(seedFromString(seedText));
    const bucket = random();

    // Low tail: 3% (30-48, power-skewed)
    if (bucket < 0.03) {
      const lowTail = Math.pow(random(), 0.4);
      return 30 + Math.floor(lowTail * 19);
    }

    // Lower-mid band: 12% (49-72, power-skewed)
    if (bucket < 0.15) {
      const lowerMid = Math.pow(random(), 0.5);
      return 49 + Math.floor(lowerMid * 24);
    }

    // Upper-mid to high band: 80% (73-91, averaged for wider spread)
    if (bucket < 0.95) {
      const avg = (random() + random() + random() + random()) / 4;
      return 73 + Math.floor(avg * 19);
    }

    // Tail: 5% (92-100, exponential decay)
    let score = 92;
    while (score < 100 && random() < 0.35) {
      score += 1;
    }
    return score;
  };

  const getFitColor = (fitPercent) => {
    if (fitPercent < 50) {
      return 'bg-red-600';
    }
    if (fitPercent < 75) {
      return 'bg-yellow-500';
    }
    if (fitPercent < 89) {
      return 'bg-green-600';
    }
    return 'bg-green-800';
  };

  const fitSeed = `${scholarship.id}-${scholarship.title || ''}-${scholarship.provider || ''}`;
  const fitPercent = sampleFitPercent(fitSeed);

  const amount = scholarship.amount
    ? `$${scholarship.amount.toLocaleString()}`
    : scholarship.amount_text || 'Amount TBD';

  const deadline = scholarship.deadline
    ? new Date(scholarship.deadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No deadline';

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-xl p-8 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {scholarship.title}
            </h2>
            {scholarship.provider && (
              <p className="text-sm text-gray-600">by {scholarship.provider}</p>
            )}
          </div>
          <div className={`ml-4 flex flex-col items-center ${getFitColor(fitPercent)} text-white rounded-xl px-3 py-2 shadow-md min-w-[64px]`}>
            <span className="text-2xl font-extrabold leading-none">{fitPercent}%</span>
            <span className="text-xs font-semibold mt-0.5 whitespace-nowrap">Fit</span>
          </div>
        </div>

        {/* Amount Highlight */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4 border-2 border-green-200">
          <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
            Award Amount
          </p>
          <p className="text-3xl font-bold text-green-600">{amount}</p>
        </div>

        {/* Deadline */}
        <div className="mb-4">
          <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
            Deadline
          </p>
          <p className="text-sm font-medium text-gray-900">{deadline}</p>
        </div>

        {/* Description */}
        {scholarship.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 line-clamp-4">
              {scholarship.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {scholarship.Tags && scholarship.Tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {scholarship.Tags.slice(0, 5).map((tag) => (
              <span
                key={tag.id}
                className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full border border-blue-300"
              >
                {tag.name}
              </span>
            ))}
            {scholarship.Tags.length > 5 && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-300">
                +{scholarship.Tags.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600 font-semibold">
          Swipe left to pass • Swipe right to save
        </p>
      </div>
    </div>
  );
};
