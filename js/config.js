/* ==========================================================
   Everything below is written so the page still works fully
   (content visible, typing effects, nav, live stats) even if
   the GSAP CDN fails to load — only the extra motion polish
   (kinetic reveals, magnetic buttons, tilt) requires GSAP.
   ========================================================== */
const gsapAvailable = (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined');
if(!gsapAvailable){ document.documentElement.classList.add('no-gsap'); }
else{ gsap.registerPlugin(ScrollTrigger); }

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches || window.innerWidth < 900;

