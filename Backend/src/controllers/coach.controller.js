const { supabase } = require('../db/database');
const { loadPreferences } = require('./preferences.controller');

// ─── Rule-based skincare AI engine ────────────────────────────────────────────
const RULES = [
  { match: /dry skin|dryness|flaky|moisture|hydrat/i,
    reply: 'For dry skin, layer a hyaluronic acid serum under a ceramide-rich moisturizer. Apply while your face is still slightly damp to lock in hydration. Avoid foaming cleansers — opt for cream or oil-based ones instead.' },
  { match: /oily skin|oily|shine|greasy|sebum/i,
    reply: 'For oily skin, use a gentle gel cleanser twice a day and a lightweight, non-comedogenic moisturizer. Niacinamide (5–10%) is excellent for regulating sebum production without stripping the skin.' },
  { match: /vitamin c|retinol|mix|combine|together/i,
    reply: 'You can use Vitamin C and Retinol — just not at the same time. Use Vitamin C in your AM routine (it pairs well with SPF) and Retinol in your PM routine. This prevents irritation and maximises the benefits of both.' },
  { match: /niacinamide|niacin/i,
    reply: 'Niacinamide is one of the most versatile ingredients — it reduces pores, regulates oil, brightens skin tone and strengthens the barrier. It pairs well with almost everything including Retinol, AHAs, and Vitamin C.' },
  { match: /retinol|retinoid|tretinoin/i,
    reply: 'Start Retinol slowly — once or twice a week at night, then gradually increase. Always follow with moisturizer and use SPF the next morning as retinoids increase sun sensitivity. Avoid using it with AHAs/BHAs on the same night.' },
  { match: /spf|sunscreen|sun protect/i,
    reply: 'SPF is the single most effective anti-aging product you can use. Choose SPF 30 minimum (SPF 50 preferred) and reapply every 2 hours when outdoors. Chemical SPFs are lighter; mineral SPFs (zinc oxide) are gentler for sensitive skin.' },
  { match: /pore|large pore|minimize pore/i,
    reply: 'Pores cannot permanently shrink, but you can minimize their appearance. Salicylic acid (BHA) deep-cleans inside pores, niacinamide tightens their look, and consistent exfoliation prevents them from getting clogged.' },
  { match: /dark circle|under eye|puffy|puffiness|eye bag/i,
    reply: 'For dark circles and puffiness, try a caffeine-based eye cream in the morning and a retinol-based one at night. Ensure 7–8 hours of sleep, reduce sodium intake, and use a cold roller or chilled spoon for instant depuffing.' },
  { match: /acne|pimple|breakout|spot|blemish/i,
    reply: 'For acne, salicylic acid (BHA) helps unclog pores and benzoyl peroxide targets bacteria. Avoid picking — it causes scarring. For hormonal acne along the jawline, consider speaking to a dermatologist about options like spironolactone.' },
  { match: /scar|hyperpigment|dark spot|uneven tone|brightening/i,
    reply: 'For hyperpigmentation and scars, Vitamin C, Niacinamide, and Alpha Arbutin are great brightening ingredients. AHAs like glycolic acid speed up cell turnover to fade dark spots. Always pair with SPF — UV exposure worsens pigmentation.' },
  { match: /sensitive skin|irritat|redness|rosacea/i,
    reply: 'For sensitive skin, keep your routine minimal. Use fragrance-free, alcohol-free products. Centella Asiatica, ceramides, and oat extract are soothing ingredients. Patch-test new products on your wrist for 24 hours before applying to your face.' },
  { match: /routine|morning|night|pm|am|steps/i,
    reply: 'A solid AM routine: gentle cleanser → Vitamin C serum → moisturizer → SPF. PM routine: oil cleanser → foaming cleanser → treatment (Retinol or AHA) → moisturizer. Less is more — a consistent 5-step routine beats a complicated 12-step one.' },
  { match: /exfoliat|aha|bha|glycolic|lactic|salicylic/i,
    reply: 'AHAs (glycolic, lactic acid) work on the skin surface — great for texture, dullness and pigmentation. BHAs (salicylic acid) go deeper into pores — ideal for acne and oiliness. Start 1–2x per week and always follow with SPF.' },
  { match: /hair|scalp|dandruff|hair loss|shampoo/i,
    reply: 'For a healthy scalp, use a gentle sulfate-free shampoo and massage your scalp for 60 seconds during washing to boost circulation. Rosemary oil has shown results comparable to minoxidil for hair growth. Avoid over-washing — 2–3x per week is ideal for most hair types.' },
  { match: /lip|chapped|dry lip/i,
    reply: 'For chapped lips, exfoliate gently with a lip scrub once a week and apply a thick balm with shea butter, lanolin or petrolatum overnight. Avoid licking your lips — saliva dries them out further.' },
  { match: /brow|eyebrow|thickness/i,
    reply: 'For fuller brows, castor oil applied nightly can stimulate growth over 4–6 weeks. A brow serum with peptides helps with density. Avoid over-plucking — sparse brows take months to recover.' },
];

const FALLBACK_REPLIES = [
  'Great question! For the best personalised advice, I\'d recommend booking a full scan so I can analyse your current skin metrics. In general, consistency is the most important factor in any skincare routine.',
  'That\'s something worth exploring more deeply. A full scan analysis will give me the context to provide a tailored recommendation specifically for your skin type and concerns.',
  'I want to give you the most accurate advice. Could you tell me more about your specific concern — for example, is this affecting a particular area of your face or body?',
];

const PERSONALITY_STYLE = {
  motivational: (text) => `You've got this! ${text} Every step counts.`,
  gentle: (text) => `No pressure at all — ${text.charAt(0).toLowerCase()}${text.slice(1)} Be kind to your skin and yourself.`,
  clinical: (text) => text,
  witty: (text) => `${text} Your skin will thank you — probably not out loud, though.`,
};

function generateReply(userMessage, personality = 'motivational') {
  let base = null;
  for (const rule of RULES) {
    if (rule.match.test(userMessage)) { base = rule.reply; break; }
  }
  base ||= FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
  return (PERSONALITY_STYLE[personality] || PERSONALITY_STYLE.clinical)(base);
}

// ─── Controller ───────────────────────────────────────────────────────────────

async function getHistory(req, res) {
  const { data, error } = await supabase
    .from('coach_messages')
    .select('*')
    .eq('user_id', req.userId)
    .order('created_at', { ascending: true })
    .limit(100);
  if (error) throw new Error(error.message);
  return res.json({ messages: data || [] });
}

async function sendMessage(req, res) {
  const { message } = req.body || {};
  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  const now = new Date().toISOString();
  const userMsg = {
    user_id: req.userId,
    from: 'user',
    text: String(message).trim(),
    created_at: now,
  };

  const { coachStyle } = await loadPreferences(req.userId);
  const replyText = generateReply(userMsg.text, coachStyle.personality);
  const replyMsg = {
    user_id: req.userId,
    from: 'coach',
    text: replyText,
    created_at: new Date(Date.now() + 1).toISOString(), // 1ms after so ordering is correct
  };

  const { data, error } = await supabase
    .from('coach_messages')
    .insert([userMsg, replyMsg])
    .select();
  if (error) throw new Error(error.message);

  return res.status(201).json({ messages: data });
}

async function clearHistory(req, res) {
  const { error } = await supabase
    .from('coach_messages')
    .delete()
    .eq('user_id', req.userId);
  if (error) throw new Error(error.message);
  return res.json({ success: true });
}

module.exports = { getHistory, sendMessage, clearHistory };
