(function () {
  // 名字遮罩靠渲染層自我校準（讀像素認出名字 draw）。校準必須在牌桌已渲染時跑；
  // authGame 抵達時畫面還在載入，太早校準會挑錯或挑不到，而且只喊一次就再也不重試。
  // 因此這裡持續重試，直到 nameMaskStatus().targets>0（已認出名字）才停；校準進行中不打斷。
  var masked = false;
  window.__nakiPlugins.register({
    id: 'naki-plugin-ex-name-hider',
    onReceive: function (ctx) {
      var H = window.__nakiHighlight;
      if (!H || !H.setNameMask) return;
      var hide = (ctx.settings && typeof ctx.settings.hide === 'boolean') ? ctx.settings.hide : true;
      if (!hide) {
        if (masked) { H.setNameMask(false); masked = false; ctx.log('setNameMask(false)'); }
        return;
      }
      var st = H.nameMaskStatus ? H.nameMaskStatus() : null;
      if (st && st.targets > 0) { masked = true; return; }  // 已認出名字，收工
      if (st && st.calibrating) return;                     // 校準進行中，別重置
      H.setNameMask(true);                                  // 尚未認出 → 觸發（重）校準
      ctx.log('setNameMask(true) 校準中');
    }
  });
})();
