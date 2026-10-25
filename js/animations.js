/* ---------- Everything below needs GSAP for the extra motion polish ---------- */
if(gsapAvailable){

  /* Hero title reveal */
  gsap.timeline({delay: 0.3})
    .from('.hero-title .line span', {yPercent:120, opacity:0, duration:.9, ease:'expo.out', stagger:.12})
    .from('.hero-sub', {opacity:0, y:16, duration:.6}, '-=.4')
    .from('.btn-row .btn', {opacity:0, y:16, duration:.5, stagger:.1}, '-=.35')
    .fromTo('#heroPhoto', {opacity:0, scale:.92, filter:'blur(14px)'}, {opacity:1, scale:1, filter:'blur(0px)', duration:1}, '-=.7')
    .from('.hero-tags', {opacity:0, y:10, stagger:.1, duration:.5}, '-=.5')
    .from('#navbarWrap', {y:-30, opacity:0, duration:.6}, '-=1.1');

  /* Scroll reveals */
  document.querySelectorAll('.reveal').forEach((el)=>{
    gsap.to(el, {
      opacity:1, y:0, filter:'blur(0px)', duration:.9, ease:'power3.out',
      scrollTrigger:{ trigger: el, start:'top 88%' }
    });
  });

  /* Project visuals subtle tilt */
  if(!isTouch){
    document.querySelectorAll('.project-visual').forEach(v=>{
      v.addEventListener('mousemove', e=>{
        const r = v.getBoundingClientRect();
        const px = (e.clientX - r.left)/r.width - .5;
        const py = (e.clientY - r.top)/r.height - .5;
        v.style.transform = `perspective(700px) rotateY(${px*6}deg) rotateX(${-py*6}deg)`;
      });
      v.addEventListener('mouseleave', ()=>{ v.style.transform = 'none'; });
    });
  }

  /* Magnetic buttons */
  if(!isTouch){
    document.querySelectorAll('.magnetic-btn').forEach(btn=>{
      const inner = btn.querySelector('.inner');
      btn.addEventListener('mousemove', e=>{
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width/2) * .35;
        const y = (e.clientY - r.top - r.height/2) * .35;
        gsap.to(inner, {x, y, duration:.3, ease:'power2.out'});
        gsap.to(btn, {x:x*.3, y:y*.3, duration:.3, ease:'power2.out'});
      });
      btn.addEventListener('mouseleave', ()=>{
        gsap.to(inner, {x:0, y:0, duration:.4, ease:'elastic.out(1,.4)'});
        gsap.to(btn, {x:0, y:0, duration:.4, ease:'elastic.out(1,.4)'});
      });
    });
  }

} /* end gsapAvailable block */
