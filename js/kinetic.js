/* ============================================================
   kinetic.js — motion graphic typography web (GSAP).
   Jalan hanya jika GSAP tersedia dan reduced-motion mati.
   ============================================================ */
if(gsapAvailable && !reduceMotion){
  const $$ = (s)=>gsap.utils.toArray(s);

  const splitWords = (el)=>{
    const out = [];
    (function walk(node){
      [...node.childNodes].forEach(n=>{
        if(n.nodeType === 3){
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(t=>{
            if(!t) return;
            if(/^\s+$/.test(t)){ frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'kw';
            const i = document.createElement('span'); i.className = 'kwi'; i.textContent = t;
            w.appendChild(i); frag.appendChild(w); out.push(i);
          });
          n.replaceWith(frag);
        }else if(n.nodeType === 1 && n.tagName !== 'BR'){ walk(n); }
      });
    })(el);
    return out;
  };

  /* ---------- Progress bar ---------- */
  const bar = document.createElement('div'); bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  gsap.to(bar, {scaleX:1, ease:'none',
    scrollTrigger:{trigger:document.documentElement, start:'top top', end:'bottom bottom', scrub:.3}});

  /* ---------- Hero: huruf naik dari mask, lalu bisa "dilompati" ---------- */
  const chars = [];
  $$('.hero-title .line > span').forEach(sp=>{
    const txt = sp.textContent; sp.textContent = '';
    [...txt].forEach(c=>{
      const s = document.createElement('span'); s.className = 'ch'; s.textContent = c;
      sp.appendChild(s); chars.push(s);
    });
  });
  chars.forEach((c,i)=>{ if(c.closest('.grad-text')){ c.classList.add('gt'); c.style.animationDelay = (-i*.14)+'s'; } });
  gsap.set('.hero-title .line > span', {opacity:1, yPercent:0});
  gsap.from(chars, {yPercent:120, rotate:8, scale:.8, opacity:0, duration:.9,
    ease:'back.out(1.7)', stagger:{each:.03, from:'start'}, delay:.35,
    onComplete:()=>$$('.hero-title .line').forEach(l=>{ l.style.overflow = 'visible'; })});

  if(!isTouch){
    chars.forEach(c=>c.addEventListener('mouseenter', ()=>{
      if(gsap.isTweening(c)) return;
      gsap.fromTo(c, {y:0, rotate:0}, {y:-22, rotate:gsap.utils.random(-10,10), duration:.2,
        yoyo:true, repeat:1, ease:'power2.out'});
    }));
  }

  /* baris hero bergeser berlawanan arah saat scroll */
  const drift = isTouch ? 5 : 9;
  $$('.hero-title .line').forEach((l,i)=>{
    gsap.to(l, {xPercent:i%2 ? drift : -drift, ease:'none',
      scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:true}});
  });

  /* ---------- Judul section: kata naik dari mask + blok kuning menyapu ---------- */
  $$('.display-lg, .display-xl').forEach(h=>{
    h.classList.remove('reveal'); gsap.set(h, {opacity:1, y:0});
    const words = splitWords(h);
    const tl = gsap.timeline({scrollTrigger:{trigger:h, start:'top 85%'}});
    tl.from(words, {yPercent:115, rotate:5, duration:.85, ease:'expo.out', stagger:.07});
    h.querySelectorAll('.grad-text .kwi').forEach((e,i)=>{ e.classList.add('gt'); e.style.animationDelay = (-i*.5)+'s'; });
  });

  /* ---------- Kicker: spasi huruf menutup ---------- */
  $$('.kicker').forEach(k=>{
    gsap.from(k, {letterSpacing:'.6em', opacity:0, duration:1.1, ease:'power3.out',
      scrollTrigger:{trigger:k, start:'top 90%'}});
  });

  /* ---------- Kata hantu: geser horizontal mengikuti scroll ---------- */
  $$('.topic-block[data-ghost]').forEach(sec=>{
    gsap.fromTo(sec, {'--gx':'12vw'}, {'--gx':'-45vw', ease:'none',
      scrollTrigger:{trigger:sec, start:'top bottom', end:'bottom top', scrub:true}});
  });

  /* ---------- Kategori proyek: masuk bergantian kiri/kanan ---------- */
  $$('.proj-cats .stack-item').forEach((row,i)=>{
    gsap.from(row.querySelector('.name'), {xPercent:i%2 ? 20 : -20, opacity:0, duration:.9,
      ease:'expo.out', scrollTrigger:{trigger:row, start:'top 90%'}});
  });

  /* ---------- Marquee: miring mengikuti kecepatan scroll ---------- */
  const rows = $$('.marquee-row');
  const clampSkew = gsap.utils.clamp(-9, 9);
  ScrollTrigger.create({
    onUpdate: self=>{
      gsap.to(rows, {skewX: clampSkew(-self.getVelocity()/260), duration:.25, overwrite:true,
        onComplete:()=>gsap.to(rows, {skewX:0, duration:.6, ease:'elastic.out(1,.5)'})});
    }
  });


  /* ---------- Cahaya mengikuti kursor / melayang sendiri di HP ---------- */
  const glow = document.createElement('div'); glow.className = 'glow'; document.body.appendChild(glow);
  gsap.set(glow, {x:innerWidth*.5, y:innerHeight*.4});
  if(!isTouch){
    const gx = gsap.quickTo(glow,'x',{duration:.7,ease:'power3'}), gy = gsap.quickTo(glow,'y',{duration:.7,ease:'power3'});
    addEventListener('mousemove', e=>{ gx(e.clientX); gy(e.clientY); });
  }else{
    gsap.to(glow, {x:()=>innerWidth*gsap.utils.random(.2,.8), y:()=>innerHeight*gsap.utils.random(.2,.8), duration:5, ease:'sine.inOut', repeat:-1, repeatRefresh:true, yoyo:true});
  }

  /* marquee pertama diisi warna, foto about parallax */
  if(rows[0]) rows[0].classList.add('m-fill');
  $$('.about-photo img').forEach(img=>{
    gsap.set(img, {scale:1.2});
    gsap.fromTo(img, {yPercent:-7}, {yPercent:7, ease:'none', scrollTrigger:{trigger:img.parentNode, start:'top bottom', end:'bottom top', scrub:true}});
  });

  /* ---------- SLAM: kata penuh layar, di-pin, warna latar berganti ---------- */
  const slam = document.querySelector('.slam');
  if(slam){
    const words = $$('.slam-word');
    const theme = [['#07070a','#c6ff3d'], ['#c6ff3d','#07070a'], ['#7c5cff','#ffffff'], ['#ff4d8d','#07070a']];
    const counter = slam.querySelector('.slam-count');
    slam.classList.add('slam-on');
    words.forEach(w=>{ const t=w.textContent; w.textContent=''; [...t].forEach(c=>{ const x=document.createElement('span'); x.className='ch'; x.textContent=c; w.appendChild(x); }); });
    gsap.set(words, {autoAlpha:0});
    gsap.set(slam, {backgroundColor:theme[0][0], color:theme[0][1]});
    const tl = gsap.timeline({defaults:{ease:'none'}, scrollTrigger:{
      trigger:slam, start:'top top', end:'+=' + (words.length * 75) + '%', pin:true, scrub:.5,
      onUpdate:self=>{
        if(counter) counter.textContent = '0' + (Math.min(words.length-1, Math.floor(self.progress*words.length)) + 1) + ' / 0' + words.length;
      }}});
    words.forEach((w,i)=>{
      tl.to(slam, {backgroundColor:theme[i%theme.length][0], color:theme[i%theme.length][1], duration:.25}, i)
        .fromTo(w, {autoAlpha:0, scale:1.8, yPercent:20},
                   {autoAlpha:1, scale:1, yPercent:0, duration:.4, ease:'power3.out'}, i)
        .fromTo(w.querySelectorAll('.ch'), {yPercent:130, rotate:14, opacity:0},
                   {yPercent:0, rotate:0, opacity:1, duration:.4, stagger:.025, ease:'back.out(1.8)'}, i);
      if(i < words.length-1) tl.to(w, {autoAlpha:0, scale:.55, yPercent:-45, rotate:5, duration:.25, ease:'power2.in'}, i+.75);
    });
  }
}
