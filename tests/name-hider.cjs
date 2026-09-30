const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function setup(legacy = false) {
  let spec, enabled = false;
  const calls = [];
  const window = {
    __nakiPlugins: legacy ? { register(value) { spec = value; } }
      : { register(value) { spec = value; }, recommendationsChanged() {} },
    __nakiHighlight: {
      nameMaskStatus() { return { enabled, targets: 0, calibrating: false }; },
      setNameMask(on) { enabled = on; calls.push(on); }
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../plugins/naki-plugin-ex-name-hider/plugin.js'), 'utf8'), { window });
  return { spec, calls, isEnabled: () => enabled };
}
const context = (hand, hide = true) => ({ context: { hand }, settings: { hide }, log() {} });
test('name hider preserves renderer cooldown and cleans up even before lock', () => {
  const { spec, calls, isEnabled } = setup();
  const ctx = context(['1m', '7p']);
  spec.onRecommendations(ctx);
  for (let i = 0; i < 20; i++) spec.onReceive(ctx);
  assert.deepEqual(calls, [true]);
  spec.onRecommendations(context(['1m'], false));
  assert.deepEqual(calls, [true, false]);
  spec.onRecommendations(ctx);
  spec.onDisable();
  assert.equal(isEnabled(), false);
});
test('empty or missing hand cannot start calibration at registration', () => {
  const { spec, calls, isEnabled } = setup();
  spec.onRecommendations(context([]));
  spec.onRecommendations({ recommendations: [], settings: { hide: true }, log() {} });
  spec.onReceive({ method: '.lq.FastTest.authGame', settings: { hide: true } });
  spec.onReceive({ method: '.lq.ActionPrototype', settings: { hide: true } });
  assert.equal(isEnabled(), false);
  assert.deepEqual(calls, []);
});
test('game reset or mode off immediately stops calibration, even before lock', () => {
  const { spec, calls, isEnabled } = setup();
  spec.onRecommendations(context(['7p']));
  spec.onRecommendations(context([]));
  assert.equal(isEnabled(), false);
  assert.deepEqual(calls, [true, false]);
});
for (const method of ['.lq.FastTest.authGame', '.lq.NotifyGameEndResult', '.lq.NotifyGameTerminate']) {
  test(method + ' clears masking without waiting for Swift recommendation sync', () => {
    const { spec, calls, isEnabled } = setup();
    spec.onRecommendations(context(['7p']));
    spec.onReceive({ method, log() {} });
    spec.onReceive({ method: '.lq.ActionPrototype', log() {} });
    assert.equal(isEnabled(), false);
    assert.deepEqual(calls, [true, false]);
    spec.onRecommendations(context(['3s']));
    assert.equal(isEnabled(), true);
  });
}
test('legacy runtime without onRecommendations falls back to packet-driven calibration', () => {
  const { spec, calls, isEnabled } = setup(true);
  spec.onReceive({ method: '.lq.FastTest.authGame', settings: { hide: true }, log() {} });
  assert.deepEqual(calls, []);
  spec.onReceive({ method: '.lq.ActionPrototype', settings: { hide: true }, log() {} });
  assert.equal(isEnabled(), true);
  spec.onReceive({ method: '.lq.ActionPrototype', settings: { hide: false }, log() {} });
  assert.equal(isEnabled(), false);
  assert.deepEqual(calls, [true, false]);
});
