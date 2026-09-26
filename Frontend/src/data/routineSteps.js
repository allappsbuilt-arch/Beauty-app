// The daily AM / PM routines. Step keys must match
// Backend/src/services/routineSteps.js, which validates completions.
// Display text lives in the translation files under `routineSteps.<key>`.

export const AM_STEPS = [
  {
    key: 'cleanser',
    categoryKey: 'routineSteps.cleanser.category',
    titleKey: 'routineSteps.cleanser.title',
    instructionsKey: 'routineSteps.cleanser.instructions',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=60',
  },
  {
    key: 'toner',
    categoryKey: 'routineSteps.toner.category',
    titleKey: 'routineSteps.toner.title',
    instructionsKey: 'routineSteps.toner.instructions',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=60',
  },
  {
    key: 'serum',
    categoryKey: 'routineSteps.serum.category',
    titleKey: 'routineSteps.serum.title',
    instructionsKey: 'routineSteps.serum.instructions',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=60',
  },
  {
    key: 'eye',
    categoryKey: 'routineSteps.eye.category',
    titleKey: 'routineSteps.eye.title',
    instructionsKey: 'routineSteps.eye.instructions',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=60',
  },
  {
    key: 'moisturizer',
    categoryKey: 'routineSteps.moisturizer.category',
    titleKey: 'routineSteps.moisturizer.title',
    instructionsKey: 'routineSteps.moisturizer.instructions',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=60',
  },
  {
    key: 'spf',
    categoryKey: 'routineSteps.spf.category',
    titleKey: 'routineSteps.spf.title',
    instructionsKey: 'routineSteps.spf.instructions',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=60',
  },
];

export const PM_STEPS = [
  {
    key: 'pm_cleanse',
    categoryKey: 'routineSteps.pm_cleanse.category',
    titleKey: 'routineSteps.pm_cleanse.title',
    instructionsKey: 'routineSteps.pm_cleanse.instructions',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=60',
  },
  {
    key: 'pm_toner',
    categoryKey: 'routineSteps.pm_toner.category',
    titleKey: 'routineSteps.pm_toner.title',
    instructionsKey: 'routineSteps.pm_toner.instructions',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=60',
  },
  {
    key: 'pm_treatment',
    categoryKey: 'routineSteps.pm_treatment.category',
    titleKey: 'routineSteps.pm_treatment.title',
    instructionsKey: 'routineSteps.pm_treatment.instructions',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=60',
  },
  {
    key: 'pm_eye',
    categoryKey: 'routineSteps.pm_eye.category',
    titleKey: 'routineSteps.pm_eye.title',
    instructionsKey: 'routineSteps.pm_eye.instructions',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=60',
  },
  {
    key: 'pm_night_cream',
    categoryKey: 'routineSteps.pm_night_cream.category',
    titleKey: 'routineSteps.pm_night_cream.title',
    instructionsKey: 'routineSteps.pm_night_cream.instructions',
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
