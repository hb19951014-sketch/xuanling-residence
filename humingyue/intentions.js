(() => {
  'use strict';
  const data = window.DESIGN_INTENTIONS;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let mode, origin, zoomPhotos = [], photoIndex = 0;
  const dialog = document.createElement('dialog');
  dialog.id = 'intent-dialog';
  dialog.setAttribute('aria-labelledby', 'intent-browser-title');
  dialog.innerHTML = '<div class="intent-browser"><header class="intent-browser-bar"><span id="intent-browser-title"></span><button type="button" data-intent-close>返回提案 ×</button></header><nav class="intent-topic-nav" aria-label="空间分类" hidden></nav><div class="intent-content"></div></div>';
  document.body.append(dialog);
  const content = dialog.querySelector('.intent-content');
  const nav = dialog.querySelector('.intent-topic-nav');
  const zoom = document.createElement('dialog');
  zoom.id = 'intent-zoom';
  zoom.setAttribute('aria-label', '意向图大图查看');
  zoom.innerHTML = '<header><div><h2></h2><p></p></div><button type="button" data-zoom-close>关闭大图 ×</button></header><img alt=""><button type="button" class="intent-prev" data-step="-1" aria-label="上一张">‹</button><button type="button" class="intent-next" data-step="1" aria-label="下一张">›</button><footer aria-live="polite"></footer>';
  document.body.append(zoom);
  const photoButton = (image, attributes, label) => `<button type="button" ${attributes} aria-label="放大${esc(label)}"><img src="${esc(image.thumb)}" alt="${esc(label)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async"><span class="intent-expand">查看大图 ↗</span></button>`;

  window.openIntent = function(selectedMode) {
    mode = selectedMode;
    origin = document.activeElement;
    nav.hidden = mode !== 'life';
    const titles = {original:'场所与原创 / PLACE & ORIGINALITY',life:'生活与体验 / LIVING & EXPERIENCE',materials:'材料与构造 / MATERIAL & DETAIL',expression:'记录与表达 / DOCUMENTATION'};
    dialog.querySelector('#intent-browser-title').textContent = titles[mode] || '';
    if (mode === 'original') renderNarrative();
    else if (mode === 'life') {
      nav.innerHTML = `<button type="button" data-area="all" aria-pressed="true">全部空间<sup>${data.life.items.reduce((sum,area)=>sum+area.images.length,0)}</sup></button>${data.life.items.map((area,i) => `<button type="button" data-area="${i}" aria-pressed="false">${esc(area.title)}<sup>${area.images.length}</sup></button>`).join('')}`;
      renderLife('all');
    } else renderProcess(mode);
    if (!dialog.open) dialog.showModal();
    content.scrollTop = 0;
  };

  function renderNarrative() {
    const cover = data.original.items[0];
    content.innerHTML = `<div class="narrative-page"><section class="narrative-cover"><p class="intent-eyebrow">AURA SPACE / DESIGN FOR YOUR LIFE</p><div class="narrative-cover-head"><h2>设计随心，<br>生活如己。</h2><p>${esc(cover.description)}</p></div><div class="narrative-cover-images">${cover.images.map((image,i) => photoButton(image, `data-cover="${i}"`, '如己设计理念')).join('')}</div><dl class="narrative-pillars">${cover.features.map(([title,description]) => `<div><dt>${esc(title)}</dt><dd>${esc(description)}</dd></div>`).join('')}</dl><div class="narrative-cover-details">${cover.details.map(text => `<p>${esc(text)}</p>`).join('')}</div></section><section class="narrative-directions"><p class="intent-eyebrow">SIX WAYS OF LIVING</p><h2>六种生活，六种空间回应。</h2><p class="intent-section-note">每个方向，将生活叙事与空间图像放在一起。点击图文层，展开查看。</p><div class="narrative-stack">${data.original.items.slice(1).map((entry,i) => `<button type="button" class="narrative-scene" data-scene="${i+1}" style="--scene:${i}" aria-label="展开${esc(entry.title)}：${esc(entry.description)}"><img src="${entry.images[0].src}" alt="${esc(entry.title)} · ${esc(entry.description)}" loading="lazy"><span class="scene-shade"></span><span class="scene-copy"><span class="scene-number">0${i+1}</span><span><strong>${esc(entry.title)}</strong><span>${esc(entry.description)}</span></span><span class="scene-open" aria-hidden="true">↗</span></span></button>`).join('')}</div></section></div>`;
  }

  function renderLife(selected) {
    nav.querySelectorAll('[data-area]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.area === String(selected))));
    content.innerHTML = `<div class="life-page"><header class="life-page-head"><p class="intent-eyebrow">SPACES FOR EVERYDAY LIVING</p><h2>从归家，到日常。</h2><p>沿着不同空间，寻找尺度、光线、材质与生活的关系。</p></header>${data.life.items.map((area,index) => selected !== 'all' && Number(selected) !== index ? '' : `<section class="life-area" data-life-area="${index}"><header><div><p class="intent-eyebrow">0${index+1} / SPACE INTENTIONS</p><h3>${esc(area.title)}</h3><p>${esc(area.description)}</p></div><span>${area.images.length} 张意向</span></header><div class="life-waterfall">${area.images.map((image,i) => `<figure>${photoButton(image, `data-life-photo="${i}" data-photo-area="${index}"`, `${area.title}第${i+1}张意向`)}<figcaption><span>${esc(area.title)}</span><span>${String(i+1).padStart(2,'0')} / ${area.images.length}</span></figcaption></figure>`).join('')}</div></section>`).join('')}</div>`;
    content.scrollTop = 0;
  }

  function renderProcess(selected) {
    const materials = selected === 'materials';
    const items = materials ? [['材料封样','围绕颜色、纹理、触感与维护方式确认材料，建立整体搭配关系。'],['节点确认','通过节点图、样板和现场复核，确定转角、拼接、分缝与收口。'],['现场协同','让设计、施工与供应链共同核对做法，把完成质量落实到细节。']] : [['竣工摄影','在适合的光线和视角下，记录空间关系、材质细节与实际生活场景。'],['设计文本','整理设计命题、平面逻辑、核心节点与完整图像，形成清晰的作品表达。'],['奖项研究','结合项目特征研究适合的奖项、申报时间和资料要求，准备对应内容。']];
    content.innerHTML = `<section class="intent-process"><p class="intent-eyebrow">${materials?'MATERIAL & DETAIL':'DOCUMENTATION & EXPRESSION'}</p><h2>${materials?'把设计，落实到细节。':'以完整作品，留下记录。'}</h2><p>${materials?'通过样板、节点与现场协同，控制完成质量。':'以竣工摄影与设计文本完整呈现作品，并研究适合的奖项申报。'}</p><div>${items.map(([title,text],i) => `<article><span>0${i+1}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div>${materials?'<button type="button" data-engineering>查看施工工艺与质量专项 ↗</button>':''}</section>`;
  }

  function openPhotos(photos, index) {
    zoomPhotos = photos;
    photoIndex = index;
    renderZoom();
    if (!zoom.open) zoom.showModal();
  }
  function renderZoom() {
    const record = zoomPhotos[photoIndex];
    zoom.querySelector('h2').textContent = record.title;
    zoom.querySelector('header p').textContent = record.description;
    const image = zoom.querySelector('img');
    image.src = record.image.src;
    image.alt = record.title + ' · ' + record.description;
    zoom.querySelector('footer').textContent = `${String(photoIndex+1).padStart(2,'0')} / ${String(zoomPhotos.length).padStart(2,'0')}`;
    zoom.querySelectorAll('[data-step]').forEach(button => button.hidden = zoomPhotos.length < 2);
  }
  dialog.addEventListener('click', event => {
    if (event.target.closest('[data-intent-close]')) dialog.close();
    const area = event.target.closest('[data-area]');
    if (area) renderLife(area.dataset.area);
    const cover = event.target.closest('[data-cover]');
    if (cover) openPhotos(data.original.items[0].images.map(image => ({image,title:'设计随心，生活如己',description:data.original.items[0].description})), Number(cover.dataset.cover));
    const scene = event.target.closest('[data-scene]');
    if (scene) openPhotos(data.original.items.slice(1).map(entry => ({image:entry.images[0],title:entry.title,description:entry.description})), Number(scene.dataset.scene)-1);
    const photo = event.target.closest('[data-life-photo]');
    if (photo) {
      const entry = data.life.items[Number(photo.dataset.photoArea)];
      openPhotos(entry.images.map(image => ({image,title:entry.title,description:entry.description})), Number(photo.dataset.lifePhoto));
    }
    if (event.target.closest('[data-engineering]')) { dialog.close(); window.openEngineering('waterproof'); }
  });
  dialog.addEventListener('close', () => origin?.focus({preventScroll:true}));
  zoom.addEventListener('click', event => {
    if (event.target.closest('[data-zoom-close]')) zoom.close();
    const step = event.target.closest('[data-step]');
    if (step) { photoIndex = (photoIndex + Number(step.dataset.step) + zoomPhotos.length) % zoomPhotos.length; renderZoom(); }
  });
  zoom.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); photoIndex = (photoIndex + (event.key === 'ArrowRight'?1:-1) + zoomPhotos.length) % zoomPhotos.length; renderZoom(); }
  });
  for (const modal of [dialog,zoom]) for (const event of ['wheel','touchstart','touchend','keydown','pointerdown','click']) modal.addEventListener(event, e => e.stopPropagation(), {passive:event === 'wheel' || event.startsWith('touch')});
})();
