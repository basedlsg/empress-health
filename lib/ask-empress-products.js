'use strict';

// Existing Empress Naturals marketplace entries, without generated medical
// claims or supplement doses. Keep links/images aligned with the marketplace.
const products = require('../data/ask_empress_products.json');
const topics = {
  skin: /\b(skin|skincare|dryness|itchy|itching|wrinkle|serum)\b/i,
  hair: /\b(hair|scalp|thinning)\b/i,
  wellness: /\b(sleep|stress|anxiety|relax|rest|massage|tension|night)\b/i,
  'self-care': /\b(self.care|routine|ritual|massage|brush|tool)\b/i,
  bundles: /\b(gifts?|bundles?|kits?)\b/i,
};

function getAskEmpressProducts(question = '') {
  const matched = Object.entries(topics).filter(([, pattern]) => pattern.test(question)).map(([category]) => category);
  return products.map((product, index) => ({ product, index, score: matched.includes(product.category) ? 1 : 0 }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 6).map(({ product }) => ({ ...product }));
}

module.exports = { getAskEmpressProducts };
