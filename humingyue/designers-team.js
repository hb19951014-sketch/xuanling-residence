(() => {
  'use strict';
  const designers = window.TEAM_DESIGNERS || [];
  const originalOpenDesigner = window.openDesigner;
  const body = document.getElementById('designer-body');
  const dialog = document.getElementById('designer');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let current, projectIndex = 0, photoIndex = 0;
  const lightbox = document.createElement('dialog');
  lightbox.id = 'team-work-lightbox';
  lightbox.setAttribute('aria-label', '设计师作品大图');
  lightbox.innerHTML = '<header><span class="team-lightbox-title"></span><button type="button" data-close aria-label="关闭作品大图">关闭 ×</button></header><img alt=""><button type="button" class="team-image-prev" data-step="-1" aria-label="上一张">‹</button><button type="button" class="team-image-next" data-step="1" aria-label="下一张">›</button><footer></footer>';
  document.body.append(lightbox);

  window.openDesigner = function(index) {
    const selected = designers.find(person => person.index === index);
    if (!selected) return originalOpenDesigner(index);
    current = selected;
    body.innerHTML = `<div class="team-profile"><div class="team-profile-intro"><img class="team-profile-portrait" src="${escape(current.portrait)}" alt="${escape(current.name)} · ${escape(current.role)}"><div><p class="meta">${escape(current.english)}</p><h2 class="team-profile-name">${escape(current.name)}</h2><p class="team-profile-role">${escape(current.role)}</p><h3>${escape(current.tagline)}</h3><p class="team-profile-copy">${escape(current.intro)}</p><dl>${current.facts.map(([key,value]) => `<div><dt>${escape(key)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl></div></div><section class="team-selected"><p class="meta">SELECTED WORKS / 代表作品</p><h3>让作品，讲述空间与生活。</h3><nav class="team-project-select" aria-label="${escape(current.name)}的作品分类">${current.projects.map((project,index) => `<button type="button" data-team-project="${index}" aria-pressed="false"><img src="${escape(project.cover)}" alt="" loading="lazy"><span>${escape(project.name)}</span></button>`).join('')}</nav><div class="team-project-content"></div></section></div>`;
    renderProject(0);
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  };

  function renderProject(index) {
    projectIndex = index;
    const project = current.projects[index];
    body.querySelectorAll('[data-team-project]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.teamProject) === index)));
    body.querySelector('.team-project-content').innerHTML = `<div class="team-work-heading"><p class="meta">${escape(project.category)}</p><h3>${escape(project.name)}</h3><p>${escape(project.description)}</p></div><div class="team-work-images ${project.kind === 'scheme' ? 'is-scheme' : ''}">${project.images.map((image,index) => `<figure><button type="button" data-team-image="${index}" aria-label="放大${escape(project.name)}第${index+1}张"><img src="${escape(image.src)}" alt="${escape(project.name)} · ${escape(image.label)}" width="${image.width}" height="${image.height}" loading="${index < 2 ? 'eager' : 'lazy'}" decoding="async"><span>查看大图 ↗</span></button><figcaption><span>${escape(image.label)}</span><span>${String(index+1).padStart(2,'0')} / ${String(project.images.length).padStart(2,'0')}</span></figcaption></figure>`).join('')}</div>`;
  }

  function showPhoto(index) {
    const project = current.projects[projectIndex];
    photoIndex = (index + project.images.length) % project.images.length;
    const photo = project.images[photoIndex];
    const image = lightbox.querySelector('img');
    image.src = photo.src;
    image.alt = project.name + ' · ' + photo.label;
    lightbox.querySelector('.team-lightbox-title').textContent = `${current.name} / ${project.name}`;
    lightbox.querySelector('footer').textContent = `${photo.label}　 ${photoIndex+1} / ${project.images.length}`;
    if (!lightbox.open) lightbox.showModal();
  }

  body.addEventListener('click', event => {
    const project = event.target.closest('[data-team-project]');
    if (project) renderProject(Number(project.dataset.teamProject));
    const photo = event.target.closest('[data-team-image]');
    if (photo) showPhoto(Number(photo.dataset.teamImage));
  });
  lightbox.addEventListener('click', event => {
    if (event.target.closest('[data-close]')) lightbox.close();
    const step = event.target.closest('[data-step]');
    if (step) showPhoto(photoIndex + Number(step.dataset.step));
  });
  lightbox.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showPhoto(photoIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  for (const name of ['wheel', 'touchstart', 'touchend']) lightbox.addEventListener(name, event => event.stopPropagation(), {passive:true});
})();
