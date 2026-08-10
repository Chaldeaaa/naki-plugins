window.__nakiPlugins.register({
  id: 'naki-plugin-ex-tile-highlighter',
  onReceive: function (ctx) {
    var recs = window.__nakiRecommendations || [];
    var best = null, bestP = -1;
    for (var i = 0; i < recs.length; i++) {
      var r = recs[i];
      if (r.actionType === 'discard' && r.tile && r.probability > bestP) { best = r; bestP = r.probability; }
    }
    if (best && window.__nakiHighlight && window.__nakiHighlight.set) {
      var c = (ctx.settings && ctx.settings.color) || 'green';
      var rgb = c === 'red' ? [1, 0.2, 0.2] : c === 'blue' ? [0.3, 0.5, 1] : [0.2, 1, 0.4];
      window.__nakiHighlight.set([{ tile: best.tile, color: rgb }], null);
      ctx.log('highlight ' + best.tile + ' p=' + best.probability.toFixed(2));
    }
  }
});
