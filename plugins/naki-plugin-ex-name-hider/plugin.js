(function () {
  function apply(ctx) {
    var H = window.__nakiHighlight;
    if (!H || !H.setNameMask) return;
    var hide = !ctx.settings || ctx.settings.hide !== false;
    var state = H.nameMaskStatus ? H.nameMaskStatus() : null;
    // The renderer owns retry/cooldown; repeated packets must not reset it.
    if (!state || state.enabled !== hide) {
      H.setNameMask(hide);
      ctx.log('setNameMask(' + hide + ')');
    }
  }
  window.__nakiPlugins.register({
    id: 'naki-plugin-ex-name-hider',
    onReceive: apply,
    onRecommendations: apply,
    onDisable: function () {
      if (window.__nakiHighlight) window.__nakiHighlight.setNameMask(false);
    }
  });
})();
