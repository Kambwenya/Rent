import test from 'node:test';
import assert from 'node:assert/strict';

test('base44 exposes the client entity API', async () => {
  const { base44 } = await import('./base44Client.js');

  assert.ok(base44.entities.Client, 'Client entity API should be registered');
  assert.equal(typeof base44.entities.Client.list, 'function');
  assert.equal(typeof base44.entities.Client.create, 'function');
});
