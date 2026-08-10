(function () {
  var lastApplied = null;
  window.__nakiPlugins.register({
    id: 'naki-plugin-ex-name-hider',
    onReceive: function (ctx) {
      var hide = (ctx.settings && typeof ctx.settings.hide === 'boolean') ? ctx.settings.hide : true;
      if (hide === lastApplied) return;
      if (window.__nakiHighlight && window.__nakiHighlight.setNameMask) {
        window.__nakiHighlight.setNameMask(hide);
        lastApplied = hide;
        ctx.log('setNameMask(' + hide + ')');
      }
    }
  });
})();
