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

function getAskEmpressBlog(slug) {
  // Packaged separately because public/ is excluded from the Vercel function.
  const post = require('../data/ask_empress_guides.json').find(post => post.slug === slug);
  if (!post) return null;
  const articleText = String(post.content || '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/(?:p|div|h[1-6]|li)>|<br\s*\/?\s*>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(x[\da-f]+|\d+);/gi, (_, code) => {
      const point = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : parseInt(code, 10);
      return point <= 0x10ffff ? String.fromCodePoint(point) : '';
    })
    .replace(/&(amp|nbsp|lt|gt|quot|apos|rsquo|lsquo|rdquo|ldquo|ndash|mdash);/g,
      (_, entity) => ({ amp: '&', nbsp: ' ', lt: '<', gt: '>', quot: '"', apos: "'", rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—' })[entity])
    .replace(/\n\s*\n/g, '\n\n').trim();
  return { slug: post.slug, title: post.title, url: `https://empresshealth.ai/expertblogs#${post.slug}`, articleText };
}

function findAskEmpressBlog(question) {
  const normalized = String(question || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  const matches = BLOGS.map((blog) => {
    if (blog.requires && !blog.requires.some((term) => normalized.includes(term))) return null;
    const score = blog.terms.reduce((total, term) => total + (normalized.includes(term) ? term.length : 0), 0);
    return score ? { blog, score } : null;
  }).filter(Boolean).sort((a, b) => b.score - a.score);
  if (!matches.length) return null;
  const post = getAskEmpressBlog(matches[0].blog.slug);
  if (!post) return null;
  const { slug, title, url } = post;
  return { slug, title, url };
}

module.exports = { findAskEmpressBlog, getAskEmpressBlog };
