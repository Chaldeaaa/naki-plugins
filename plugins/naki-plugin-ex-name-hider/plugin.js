(function () {
  'use strict';
  function setEnabled(hide, ctx) {
    var H = window.__nakiHighlight;
    if (!H || !H.setNameMask) return;
    var state = H.nameMaskStatus ? H.nameMaskStatus() : null;
    // Preserve the renderer's calibration cooldown while the state is unchanged.
    if (!state || state.enabled !== hide) {
      H.setNameMask(hide);
      if (ctx && ctx.log) ctx.log('setNameMask(' + hide + ')');
    }
  }
  function apply(ctx) {
    // Registration replays recommendations even in the lobby. Never start an
    // invasive UI calibration without the current hand snapshot from Naki.
    // Missing context (older runtimes), loading, mode off and game reset stay off.
    var hand = ctx.context && ctx.context.hand;
    var ready = Array.isArray(hand) && hand.length > 0;
    setEnabled(ready && (!ctx.settings || ctx.settings.hide !== false), ctx);
  }
  window.__nakiPlugins.register({
    id: 'naki-plugin-ex-name-hider',
    onReceive: function (ctx) {
      // Authentication precedes the table rendering. Terminal events can arrive
      // before Swift clears the hand snapshot. None of these may enable masking.
      if (ctx.method === '.lq.FastTest.authGame'
          || ctx.method === '.lq.NotifyGameEndResult'
          || ctx.method === '.lq.NotifyGameTerminate') setEnabled(false, ctx);
    },
    onRecommendations: apply,
    onDisable: function () {
      if (window.__nakiHighlight) window.__nakiHighlight.setNameMask(false);
    }
  });
})();
