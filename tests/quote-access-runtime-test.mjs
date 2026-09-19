import assert from 'node:assert/strict';
import {
  createMemoryRateLimiter,
  normalizeConfirmedName,
  quoteExpiry,
  quoteTokenHash,
  randomQuoteToken,
  validQuoteId,
  validQuoteToken,
} from '../supabase/functions/_shared/quote-access.mjs';

const token = randomQuoteToken();
assert.ok(validQuoteToken(token), 'generated token must be 43 base64url characters');
const hash = await quoteTokenHash(token);
assert.match(hash, /^[0-9a-f]{64}$/, 'stored token hash must be lowercase SHA-256 hex');
assert.equal(hash, await quoteTokenHash(token), 'same token must hash consistently');
assert.notEqual(hash, token, 'raw token must not equal the stored hash');

assert.equal(validQuoteToken('short'), false, 'short token must be rejected');
assert.equal(validQuoteToken('a'.repeat(42) + '+'), false, 'non-base64url token must be rejected');
assert.equal(validQuoteId('11111111-1111-4111-8111-111111111111'), true, 'valid v4 UUID must be accepted');
assert.equal(validQuoteId('not-a-quote'), false, 'malformed quote id must be rejected');

assert.equal(normalizeConfirmedName('  Sarah   Jones '), 'Sarah Jones', 'name whitespace must be normalised');
assert.equal(normalizeConfirmedName('S'), null, 'one-character name must be rejected');
assert.equal(normalizeConfirmedName('x'.repeat(101)), null, 'overlong name must be rejected');
assert.equal(normalizeConfirmedName({}), null, 'non-string name must be rejected');

const now = new Date('2026-09-19T12:00:00.000Z');
assert.equal(quoteExpiry('2026-09-25', now), '2026-09-25T23:59:59.999Z', 'near quote validity date must win');
assert.equal(quoteExpiry('2027-01-01', now), '2026-10-19T12:00:00.000Z', 'thirty-day maximum must win');
assert.equal(quoteExpiry('2026-09-01', now), '2026-10-19T12:00:00.000Z', 'past validity date must fall back to thirty days');

const allow = createMemoryRateLimiter({ windowMs: 1_000, limit: 2 });
assert.equal(allow('quote', 1), true, 'first request must pass');
assert.equal(allow('quote', 2), true, 'second request must pass');
assert.equal(allow('quote', 3), false, 'third request in window must fail');
assert.equal(allow('other', 3), true, 'other token hash must have its own bucket');
assert.equal(allow('quote', 1_002), true, 'expired bucket must reset');

console.log('Quote access runtime helper tests passed.');
