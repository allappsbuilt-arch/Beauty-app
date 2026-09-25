// The daily AM / PM routines. Step keys must match
// Backend/src/services/routineSteps.js, which validates completions.

export const AM_STEPS = [
  {
    key: 'cleanser',
    category: 'CLEANSER',
    title: 'Gentle Cleanser',
    instructions: 'Massage onto damp skin for 30 seconds, then rinse with lukewarm water.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=60',
  },
  {
    key: 'toner',
    category: 'TONER & MIST',
    title: 'Rose Water Revitalize',
    instructions: 'Apply 3-4 sprays or use a cotton pad. This balances your pH levels and prepares your skin to absorb serums more effectively.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=60',
  },
  {
    key: 'serum',
    category: 'VITAMIN C SERUM',
    title: 'Brightening Core',
    instructions: 'Press 2-3 drops into skin, avoiding the eye area. Follow with moisturizer.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=60',
  },
  {
    key: 'eye',
    category: 'EYE CARE',
    title: 'Caffeine Eye Gel',
    instructions: 'Dab gently along the orbital bone using your ring finger.',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=60',
  },
  {
    key: 'moisturizer',
    category: 'MOISTURIZER',
    title: 'Barrier Repair Cream',
    instructions: 'Warm a coin-sized amount between palms and press into skin.',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=60',
  },
  {
    key: 'spf',
    category: 'SUN PROTECTION',
    title: 'SPF 50+ Shield',
    instructions: 'Apply generously as the final step, 15 minutes before sun exposure.',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=60',
  },
];

export const PM_STEPS = [
  {
    key: 'pm_cleanse',
    category: 'DOUBLE CLEANSE',
    title: 'Cleansing Balm + Gel',
    instructions: 'Melt the balm over dry skin to lift SPF and makeup, emulsify with water, then follow with your gentle gel cleanser.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=60',
  },
  {
    key: 'pm_toner',
    category: 'HYDRATING TONER',
    title: 'Calming Essence',
    instructions: 'Pat a few drops into slightly damp skin to replenish hydration after cleansing.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=60',
  },
  {
    key: 'pm_treatment',
    category: 'NIGHT TREATMENT',
    title: 'Retinol Renewal Serum',
    instructions: 'Apply a pea-sized amount to dry skin, avoiding the eyes and corners of the nose. Start 2-3 nights a week.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=60',
  },
  {
    key: 'pm_eye',
    category: 'EYE CARE',
    title: 'Peptide Eye Cream',
    instructions: 'Tap a rice-grain amount along the orbital bone with your ring finger.',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=60',
  },
  {
    key: 'pm_night_cream',
    category: 'NIGHT CREAM',
    title: 'Overnight Recovery Cream',
    instructions: 'Seal everything in with a generous layer, pressing it gently into cheeks, forehead and neck.',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=60',
  },
];

// Rough minutes per step, used for "x mins left" estimates.
export const MINUTES_PER_STEP = 2;

export function stepsForPeriod(period) {
  return period === 'PM' ? PM_STEPS : AM_STEPS;
}

export function periodFromTitle(routineTitle = '') {
  return routineTitle.toUpperCase().startsWith('PM') ? 'PM' : 'AM';
}
