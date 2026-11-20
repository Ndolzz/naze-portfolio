/* NAZE Portfolio — main.js (vanilla, tanpa library) */
(function(){
  'use strict';
  var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  var small=innerWidth<760;

  /* navigasi: status scroll, progress, menu HP, link aktif */
  var nav=$('#nav'), prog=$('#progress'), links=$('#links'), burger=$('#burger'), ticking=false;
  function onScroll(){
    var y=scrollY, max=document.documentElement.scrollHeight-innerHeight;
    nav.classList.toggle('on',y>30);
    prog.style.transform='scaleX('+(max>0?y/max:0)+')';
    ticking=false;
  }
  addEventListener('scroll',function(){ if(!ticking){ticking=true;requestAnimationFrame(onScroll);} },{passive:true});
  onScroll();
  function setMenu(o){ links.classList.toggle('open',o); burger.setAttribute('aria-expanded',o); burger.setAttribute('aria-label',o?'Tutup menu':'Buka menu'); }
  burger.addEventListener('click',function(){ setMenu(!links.classList.contains('open')); });
  links.addEventListener('click',function(e){ if(e.target.tagName==='A') setMenu(false); });
  addEventListener('keydown',function(e){ if(e.key==='Escape') setMenu(false); });
  var secs=$$('main section[id]');
  if('IntersectionObserver' in window){
    var navIO=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ $$('.links a').forEach(function(a){ a.classList.toggle('act',a.getAttribute('href')==='#'+e.target.id); }); } }); },{rootMargin:'-45% 0px -50% 0px'});
    secs.forEach(function(s){ navIO.observe(s); });
  }

  /* reveal saat scroll */
  var rv=$$('.rv');
  if(small) $$('.tech-row .rv').forEach(function(el){ el.classList.add('in'); });
  rv.forEach(function(el){ var sib=el.parentNode.querySelectorAll(':scope > .rv'); var i=Array.prototype.indexOf.call(sib,el); el.style.setProperty('--d',Math.min(i,5)*0.07+'s'); });
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }); },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    rv.forEach(function(el){ io.observe(el); });
  }else{ rv.forEach(function(el){ el.classList.add('in'); }); }

  /* spotlight kartu + tilt foto (hanya mouse) */
  if(fine && !reduce){
    $$('.spot').forEach(function(c){ c.addEventListener('pointermove',function(e){ var r=c.getBoundingClientRect(); c.style.setProperty('--mx',(e.clientX-r.left)+'px'); c.style.setProperty('--my',(e.clientY-r.top)+'px'); }); });
    $$('.tilt').forEach(function(t){
      t.addEventListener('pointermove',function(e){ var r=t.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; t.style.transform='perspective(900px) rotateY('+(x*8)+'deg) rotateX('+(-y*8)+'deg)'; });
      t.addEventListener('pointerleave',function(){ t.style.transform=''; });
    });
  }

  /* jaringan partikel ringan di canvas */
  var cv=$('#net');
  if(cv && !reduce){
    var cx=cv.getContext('2d'), W=0,H=0,pts=[],run=true,dpr=Math.min(devicePixelRatio||1,1.5), N=small?22:52, D=small?110:150, mouse={x:-999,y:-999};
    function size(){ W=cv.width=innerWidth*dpr; H=cv.height=innerHeight*dpr; }
    size(); addEventListener('resize',function(){ size(); });
    for(var i=0;i<N;i++) pts.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25});
    if(fine) addEventListener('pointermove',function(e){ mouse.x=e.clientX; mouse.y=e.clientY; },{passive:true});
    function frame(){
      if(!run) return;
      cx.setTransform(dpr,0,0,dpr,0,0); cx.clearRect(0,0,innerWidth,innerHeight);
      for(var i=0;i<N;i++){
        var p=pts[i]; p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>innerWidth) p.vx*=-1; if(p.y<0||p.y>innerHeight) p.vy*=-1;
        cx.fillStyle='rgba(34,211,238,.7)'; cx.fillRect(p.x,p.y,1.8,1.8);
        for(var j=i+1;j<N;j++){ var q=pts[j], dx=p.x-q.x, dy=p.y-q.y, d=dx*dx+dy*dy;
          if(d<D*D){ cx.strokeStyle='rgba(59,130,246,'+(.28*(1-Math.sqrt(d)/D))+')'; cx.beginPath(); cx.moveTo(p.x,p.y); cx.lineTo(q.x,q.y); cx.stroke(); } }
        var mx=p.x-mouse.x, my=p.y-mouse.y, md=mx*mx+my*my;
        if(md<D*D*1.4){ cx.strokeStyle='rgba(57,255,136,'+(.4*(1-Math.sqrt(md)/(D*1.18)))+')'; cx.beginPath(); cx.moveTo(p.x,p.y); cx.lineTo(mouse.x,mouse.y); cx.stroke(); }
      }
      requestAnimationFrame(frame);
    }
    document.addEventListener('visibilitychange',function(){ run=!document.hidden; if(run) frame(); });
    frame();
  }

  /* status hero + terminal */
  var wait=function(ms){ return new Promise(function(r){ setTimeout(r,reduce?0:ms); }); };
  var st=$('#heroTerm');
  if(st && !reduce){
    var msgs=['MENYIAPKAN PORTOFOLIO','KREATOR TERDETEKSI','MEMUAT PROYEK... SELESAI','STATUS: ONLINE'], k=0;
    (async function(){ for(k=0;k<msgs.length;k++){ st.textContent=msgs[k]; await wait(900); } })();
  }
  var tb=$('#termBody'), lines=[['$ whoami','nendi'],['$ focus','AI · CODING · DIGITAL CREATIVITY · TECHNOLOGY'],['$ current_status','ALWAYS LEARNING. ALWAYS EXPLORING.']], typed=false;
  async function typeTerm(){
    if(typed) return; typed=true;
    for(var i=0;i<lines.length;i++){
      var row=document.createElement('div'); tb.appendChild(row);
      for(var c=0;c<=lines[i][0].length;c++){ row.innerHTML='<span class="p">'+lines[i][0].slice(0,c)+'</span><span class="caret"></span>'; await wait(28); }
      row.innerHTML='<span class="p">'+lines[i][0]+'</span>'; await wait(200);
      var o=document.createElement('div'); o.innerHTML='<span class="o">'+lines[i][1]+'</span>'; tb.appendChild(o); await wait(320);
    }
    var last=document.createElement('div'); last.innerHTML='<span class="p">$ </span><span class="caret"></span>'; tb.appendChild(last);
  }
  if(tb){
    if('IntersectionObserver' in window){ var to=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ typeTerm(); to.disconnect(); } },{threshold:.4}); to.observe(tb); }
    else typeTerm();
  }

  /* statistik GitHub nyata (gagal = tampilan tetap aman) */
  function count(el,to){
    if(reduce||isNaN(to)){ el.textContent=to; return; }
    var t0=performance.now();
    (function step(t){ var p=Math.min((t-t0)/900,1); el.textContent=Math.round(to*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(step); })(t0);
  }
  (async function(){
    try{
      var u=await (await fetch('https://api.github.com/users/Ndolzz')).json();
      if(u.public_repos!=null) count($('#statRepos'),u.public_repos);
      if(u.followers!=null) count($('#statFollowers'),u.followers);
      var res=await fetch('https://api.github.com/users/Ndolzz/repos?per_page=100');
      if(res.ok){
        var repos=await res.json(), stars=0;
        repos.forEach(function(r){
          stars+=r.stargazers_count||0;
          $$('.proj').forEach(function(card){
            if(card.getAttribute('href').toLowerCase().slice(-r.name.length-1)==='/'+r.name.toLowerCase() && r.description){ $('.desc',card).textContent=r.description; }
          });
        });
        count($('#statStars'),stars);
      }
    }catch(e){ /* biarkan nilai bawaan */ }
  })();
})();
