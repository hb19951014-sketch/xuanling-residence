(() => {
  'use strict';
  const schemes = window.RESIDENCE_FLOORPLANS;
  let schemeIndex = 0, floorIndex = 0, scale = 1, baseWidth = 0, baseHeight = 0, origin;
  const dialog = document.createElement('dialog');
  dialog.id = 'floorplan-dialog';
  dialog.setAttribute('aria-labelledby', 'floorplan-dialog-title');
  dialog.innerHTML = '<header><h2 id="floorplan-dialog-title"></h2><button type="button" data-plan-close>返回方案 ×</button></header><div class="floorplan-tools"><div><button type="button" data-plan-zoom="-0.5" aria-label="缩小平面图">−</button><button type="button" data-plan-reset aria-label="恢复全图">100%</button><button type="button" data-plan-zoom="0.5" aria-label="放大平面图">＋</button></div><span>放大后可拖动或滚动查看</span></div><div class="floorplan-scroll"><div class="floorplan-canvas"><img alt="" draggable="false"></div></div>';
  document.body.append(dialog);
  const viewport = dialog.querySelector('.floorplan-scroll');
  const canvas = dialog.querySelector('.floorplan-canvas');
  const image = canvas.querySelector('img');
  function resize() {
    const scheme = schemes[schemeIndex];
    const aspect = scheme.combinedWidth / scheme.combinedHeight;
    baseWidth = Math.max(1, Math.min(viewport.clientWidth - 30, (viewport.clientHeight - 30) * aspect));
    baseHeight = baseWidth / aspect;
    canvas.style.width = `${Math.round(baseWidth * scale)}px`;
    canvas.style.height = `${Math.round(baseHeight * scale)}px`;
    viewport.classList.toggle('is-zoomed', scale > 1);
    dialog.querySelector('[data-plan-reset]').textContent = `${Math.round(scale * 100)}%`;
  }
  function showFloor(index) {
    floorIndex = index;
    scale = 1;
    const scheme = schemes[schemeIndex];
    image.src = scheme.combined;
    image.alt = scheme.name + ' · 彩色平面';
    dialog.querySelector('h2').textContent = image.alt;
    
    requestAnimationFrame(() => { resize(); viewport.scrollTop = viewport.scrollLeft = 0; });
  }
  window.openFloorplan = function(scheme, floor) {
    origin = document.activeElement;
    schemeIndex = scheme;
    if (!dialog.open) dialog.showModal();
    showFloor(floor);
  };
  dialog.addEventListener('click', event => {
    if (event.target.closest('[data-plan-close]')) dialog.close();
    const floor = event.target.closest('[data-plan-floor]');
    if (floor) showFloor(Number(floor.dataset.planFloor));
    const step = event.target.closest('[data-plan-zoom]');
    if (step) {
      const old = scale, cx = (viewport.scrollLeft + viewport.clientWidth / 2) / (baseWidth * old), cy = (viewport.scrollTop + viewport.clientHeight / 2) / (baseHeight * old);
      scale = Math.max(1, Math.min(4, scale + Number(step.dataset.planZoom)));
      resize();
      viewport.scrollLeft = cx * baseWidth * scale - viewport.clientWidth / 2;
      viewport.scrollTop = cy * baseHeight * scale - viewport.clientHeight / 2;
    }
    if (event.target.closest('[data-plan-reset]')) { scale = 1; resize(); viewport.scrollTop = viewport.scrollLeft = 0; }
  });
  let drag;
  viewport.addEventListener('pointerdown', event => {
    if (scale <= 1 || event.pointerType !== 'mouse' || event.button !== 0) return;
    event.preventDefault();
    drag = {x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag) return;
    viewport.scrollLeft = drag.left - (event.clientX - drag.x);
    viewport.scrollTop = drag.top - (event.clientY - drag.y);
  });
  for (const name of ['pointerup','pointercancel']) viewport.addEventListener(name, () => { drag = null; });
  new ResizeObserver(() => { if (dialog.open) resize(); }).observe(viewport);
  dialog.addEventListener('close', () => origin?.focus({preventScroll:true}));
  for (const event of ['wheel','keydown','touchstart','touchend','pointerdown','click']) dialog.addEventListener(event, e => e.stopPropagation(), {passive:event === 'wheel' || event.startsWith('touch')});
})();
