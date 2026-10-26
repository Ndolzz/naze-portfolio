/* ---------- Custom cursor ---------- */
if(!isTouch){
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx=0,my=0, rx=0, ry=0;
  window.addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; dot.style.left=mx+'px'; dot.style.top=my+'px'; });
  function ringLoop(){ rx += (mx-rx)*0.16; ry += (my-ry)*0.16; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(ringLoop); }
  requestAnimationFrame(ringLoop);
  document.querySelectorAll('[data-cursor]').forEach(el=>{
    el.addEventListener('mouseenter', ()=>{
      ring.classList.add('big');
      ring.textContent = el.dataset.cursor === 'open' ? 'OPEN' : 'VIEW';
    });
    el.addEventListener('mouseleave', ()=>{ ring.classList.remove('big'); ring.textContent=''; });
  });
}

/* ---------- Navbar scroll state ---------- */
const nav = document.getElementById('navbar');
const navWrap = document.getElementById('navbarWrap');
window.addEventListener('scroll', ()=>{
  const scrolled = window.scrollY > 40;
  nav.classList.toggle('scrolled', scrolled);
  navWrap.classList.toggle('scrolled', scrolled);
});

/* ---------- Mobile nav toggle ---------- */
const navToggle = document.querySelector('.nav-toggle');
const navLinksEl = document.querySelector('.nav-links');
if(navToggle){
  navToggle.addEventListener('click', ()=>{
    navLinksEl.classList.toggle('open');
    navToggle.textContent = navLinksEl.classList.contains('open') ? '×' : '≡';
  });
  navLinksEl.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=>{ navLinksEl.classList.remove('open'); navToggle.textContent='≡'; });
  });
}

/* ---------- Floating code fragments ---------- */
const fragments = ['const idea = build();','git commit -m "ship it"','npm run dev','function create(){}','> system.online','await fetch("/api")','export default Naze;'];
const cfWrap = document.getElementById('codeFragments');
for(let i=0;i<14;i++){
  const s = document.createElement('span');
  s.textContent = fragments[i % fragments.length];
  s.style.left = Math.random()*100+'%';
  s.style.top = (100+Math.random()*20)+'%';
  s.style.animationDuration = (18+Math.random()*14)+'s';
  s.style.animationDelay = (Math.random()*18)+'s';
  cfWrap.appendChild(s);
}


/* ---------- Active nav link on scroll ---------- */
const navSections = ['certificates','about','stack','contact'].map(id=>document.getElementById(id)).filter(Boolean);
const navLinks = document.querySelectorAll('.nav-links a');
if(gsapAvailable){
  ScrollTrigger.batch(navSections, {
    start:'top 50%', end:'bottom 50%',
    onEnter: batch => batch.forEach(sec=>{
      navLinks.forEach(l=>l.classList.toggle('active', l.getAttribute('href') === '#'+sec.id));
    })
  });
}else{
  const navObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        navLinks.forEach(l=>l.classList.toggle('active', l.getAttribute('href') === '#'+entry.target.id));
      }
    });
  }, {threshold:.5});
  navSections.forEach(sec=>navObserver.observe(sec));
}

