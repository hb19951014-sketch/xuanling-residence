(() => {
 const compare=document.querySelector('.brand-renovation-compare');if(!compare)return;
 const slider=compare.querySelector('.renovation-slider');
 const update=()=>{compare.style.setProperty('--split',slider.value+'%');slider.setAttribute('aria-valuetext','改造前显示 '+slider.value+'%，改造后显示 '+(100-slider.value)+'%');};
 slider.addEventListener('input',update);
 for(const name of ['pointerdown','pointerup','click','keydown','keyup','touchstart','touchmove','touchend'])slider.addEventListener(name,event=>event.stopPropagation(),{passive:true});
 update();
})();
