'use strict';

// Only offer an article when the existing Empress blog library has a useful
// match for the visitor's question. Keep titles and slugs in sync with
// public/blogs.json; the link opens that article in the site's reader.
const BLOGS = [
  {
    slug: 'perimenopause-weight-loss-strategies',
    title: 'Perimenopause Weight Loss: Smart, Science-Backed Strategies',
    terms: ['perimenopause weight', 'weight loss', 'losing weight', 'weight gain', 'metabolism'],
  },
  {
    slug: 'menopause-diet-5-day-plan',
    title: 'The Menopause Diet 5 Day Plan to Lose Weight & Reduce Bloating',
    terms: ['diet', 'nutrition', 'bloating', 'food', 'meal plan'],
  },
  {
    slug: 'does-progesterone-cause-weight-gain',
    title: 'Does Progesterone Cause Weight Gain? What You Need to Know',
    terms: ['progesterone'],
    requires: ['weight', 'gain', 'weight gain'],
  },
  {
    slug: 'supplements-for-menopause-belly-fat',
    title: 'Top Supplements for Menopause Belly Fat That Actually Work',
    terms: ['belly fat', 'menopause supplements', 'supplements for weight'],
  },
  {
    slug: 'all-you-need-to-know-about-perimenopausal-skin',
    title: 'The Complete Skincare Guide for Perimenopausal Skin',
    terms: ['skin', 'skincare', 'dry skin', 'itchy skin', 'skin changes'],
  },
  {
    slug: 'menopausal-skincare-wellness-routine-must-haves',
    title: 'Step Up Your Menopausal Skincare and Wellness Routine: 3 Must-Haves',
    terms: ['skin care routine', 'menopause skincare', 'menopausal skin'],
  },
];

function findAskEmpressBlog(question) {
  const normalized = String(question || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  const matches = BLOGS.map((blog) => {
    if (blog.requires && !blog.requires.some((term) => normalized.includes(term))) return null;
    const score = blog.terms.reduce((total, term) => total + (normalized.includes(term) ? term.length : 0), 0);
    return score ? { blog, score } : null;
  }).filter(Boolean).sort((a, b) => b.score - a.score);
  if (!matches.length) return null;
  const { slug, title } = matches[0].blog;
  return { slug, title, url: `https://empresshealth.ai/expertblogs#${slug}` };
}

module.exports = { findAskEmpressBlog };
