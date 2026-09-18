const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getClothingGroup,
  isShoeType,
} = require('../src/utils/clothingClassification');
const {
  getRecommendationTimeoutMs,
  isAiUnavailableError,
  isValidRecommendation,
} = require('../src/services/aiClientService');

test('classifies supported footwear consistently, including slippers', () => {
  for (const type of ['shoes', 'sneakers', 'boots', 'sandals', 'slippers']) {
    assert.equal(isShoeType(type), true);
    assert.equal(getClothingGroup({ type, category: 'bottomwear' }), 'shoes');
  }
});

test('classifies persisted upperwear and bottomwear without changing stored values', () => {
  assert.equal(getClothingGroup({ type: 'T-shirt', category: 'upperwear' }), 'top');
  assert.equal(getClothingGroup({ type: 'Jeans', category: 'bottomwear' }), 'bottom');
});

test('uses the default recommendation timeout when configuration is absent', () => {
  assert.equal(getRecommendationTimeoutMs(undefined), 12000);
  assert.equal(getRecommendationTimeoutMs('15000'), 15000);
});

test('rejects invalid recommendation timeout configuration', () => {
  assert.throws(
    () => getRecommendationTimeoutMs('not-a-number'),
    /AI_RECOMMEND_TIMEOUT_MS must be a positive integer/
  );
  assert.throws(
    () => getRecommendationTimeoutMs('0'),
    /AI_RECOMMEND_TIMEOUT_MS must be a positive integer/
  );
});

test('limits fallback handling to known AI transport failures', () => {
  assert.equal(isAiUnavailableError({ code: 'ECONNREFUSED' }), true);
  assert.equal(isAiUnavailableError({ code: 'ECONNRESET' }), true);
  assert.equal(isAiUnavailableError({ code: 'ERR_BAD_RESPONSE' }), false);
  assert.equal(isAiUnavailableError({ response: { status: 500 } }), false);
});

test('rejects malformed AI recommendation responses', () => {
  assert.equal(
    isValidRecommendation({
      top: {},
      bottom: {},
      shoes: {},
      reasoning: 'Balanced outfit.',
      style_score: 0.8,
    }),
    true
  );
  assert.equal(
    isValidRecommendation({
      top: {},
      bottom: {},
      shoes: {},
      reasoning: 'Balanced outfit.',
    }),
    false
  );
});
