// Client + server constants for the Street Score funnel. Consent wording and
// profiling options live here so the exact text a visitor saw is what gets
// stored against their lead (CONSENT_VERSION travels with every capture).

export const SEGMENT_OPTIONS = [
  { value: 'buying', label: 'Buying', detail: 'Looking at this street or area to buy' },
  { value: 'own', label: 'Own here', detail: 'I already own on this street or nearby' },
  { value: 'rent', label: 'Rent here', detail: 'I rent here, or I am thinking about it' },
  { value: 'curious', label: 'Just curious', detail: 'Checking a street I know' },
];

export const SEGMENT_LABELS = Object.fromEntries(SEGMENT_OPTIONS.map((o) => [o.value, o.label]));

export const CONSENT_VERSION = 'street-score-2026-10';

export const CONSENT_TEXT = {
  sms: 'I agree to receive SMS messages from Ripehouse Advisory about this street and my enquiry. Reply STOP to opt out at any time.',
  aiCall: 'I agree to a call from Ripehouse Advisory about my enquiry, including automated or AI-assisted calls.',
};

export const COLLECTION_NOTICE = 'Ripehouse Advisory collects your details to provide the Street Review and related information. We do not sell your information. See our Privacy Policy for how to access or correct it, or to complain.';

// Progressive profiling. `motivation` names the rha_leads Investor Motivation
// column each answer feeds (dashboard fills blanks only; staff-recorded values
// are never overwritten). Option `value`s for goal/risk match the dashboard's
// DEFAULT_MOTIVATION_CONFIG keys.
export const PROFILE_QUESTIONS = [
  {
    key: 'goal',
    motivation: 'investment_goal',
    question: 'What matters most from your next property move?',
    options: [
      { value: 'growth', label: 'Capital growth / equity' },
      { value: 'cashflow', label: 'Cash flow / passive income' },
      { value: 'lifestyle', label: 'A home to live in / lifestyle' },
      { value: 'tax', label: 'Tax effectiveness' },
      { value: 'legacy', label: 'Setting up the kids / legacy' },
      { value: 'development', label: 'Development / subdivision' },
    ],
  },
  {
    key: 'timeframe',
    motivation: 'future_pacing',
    question: 'When are you looking to make a move?',
    options: [
      { value: '0-3m', label: 'In the next 3 months' },
      { value: '3-6m', label: '3 to 6 months' },
      { value: '6-12m', label: '6 to 12 months' },
      { value: '12m+', label: 'More than a year away' },
      { value: 'unsure', label: 'Not sure yet' },
    ],
  },
  {
    key: 'portfolio',
    motivation: null,
    question: 'How many properties do you own today (including your home)?',
    options: [
      { value: '0', label: 'None yet' },
      { value: '1', label: 'One' },
      { value: '2-3', label: 'Two or three' },
      { value: '4+', label: 'Four or more' },
    ],
  },
  {
    key: 'risk',
    motivation: 'risk_profile',
    question: 'Which sounds most like you?',
    options: [
      { value: 'conservative', label: 'Safe and steady — I want to sleep at night' },
      { value: 'balanced', label: 'Balanced — some risk for better returns' },
      { value: 'aggressive', label: 'Growth first — I am comfortable with risk' },
    ],
  },
  {
    key: 'onTrack',
    motivation: null,
    question: 'Compared with people your age, do you feel on track financially?',
    options: [
      { value: 'ahead', label: 'Ahead' },
      { value: 'on-track', label: 'About on track' },
      { value: 'behind', label: 'Behind' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
  {
    key: 'why',
    motivation: 'why_investing',
    question: 'What is the main reason you are looking at property right now?',
    options: [
      { value: 'Build passive income so I can reduce work hours', label: 'Build passive income' },
      { value: 'Create long-term wealth and security for my family', label: 'Long-term family security' },
      { value: 'Buy my first investment property', label: 'Buy my first investment' },
      { value: 'Relocate or upgrade my lifestyle', label: 'Relocate or upgrade' },
      { value: 'Make my super / savings work harder', label: 'Make savings work harder' },
    ],
    allowText: true,
  },
  {
    key: 'dream',
    motivation: 'dream_outcome',
    question: 'If the next five years go really well, what does that look like?',
    options: [
      { value: 'Own 2+ investment properties within 5 years', label: '2+ investment properties' },
      { value: 'Replace one salary with rental income', label: 'Replace a salary' },
      { value: 'Retire earlier with property-backed income', label: 'Retire earlier' },
      { value: 'Secure a home for my children later', label: 'A home for the kids' },
    ],
    allowText: true,
  },
];

export const PROFILE_PER_VISIT = 3;

export function sanitizeProfileAnswers(input) {
  const answers = {};
  for (const q of PROFILE_QUESTIONS) {
    const raw = input?.[q.key];
    if (raw === undefined || raw === null || raw === '') continue;
    const value = String(raw).trim().slice(0, 500);
    if (q.options.some((o) => o.value === value) || (q.allowText && value.length >= 3)) answers[q.key] = value;
  }
  return answers;
}
