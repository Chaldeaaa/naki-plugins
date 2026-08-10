window.__nakiPlugins.register({
  id: 'naki-plugin-ex-gist-logger',
  onReceive: function (ctx) {
    var tag = (ctx.settings && ctx.settings.tag) || 'gist';
    ctx.log(tag + ' ' + ctx.method + ' msgId=' + ctx.msgId);
  }
});
