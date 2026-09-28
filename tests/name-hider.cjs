const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
test('name hider preserves renderer cooldown and cleans up even before lock', () => {
  let spec, enabled = false;
  const calls = [];
  const window = {
    __nakiPlugins: { register(value) { spec = value; } },
    __nakiHighlight: {
      nameMaskStatus() { return { enabled, targets: 0, calibrating: false }; },
      setNameMask(on) { enabled = on; calls.push(on); }
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../plugins/naki-plugin-ex-name-hider/plugin.js'), 'utf8'), { window });
  const ctx = { settings: { hide: true }, log() {} };
  spec.onRecommendations(ctx);
  for (let i = 0; i < 20; i++) spec.onReceive(ctx);
  assert.deepEqual(calls, [true]);
  spec.onReceive({ settings: { hide: false }, log() {} });
  assert.deepEqual(calls, [true, false]);
  spec.onRecommendations(ctx);
  spec.onDisable();
  assert.equal(enabled, false);
});
