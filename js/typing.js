/* ---------- Hero terminal typing (pure JS, no library needed) ---------- */
const bootLines = [
  {t:'> menyiapkan portofolio nendi', cls:''},
  {t:'> sistem siap', cls:'ok'},
  {t:'> pengembang terdeteksi', cls:''},
  {t:'> memuat proyek... selesai', cls:'dim'},
  {t:'> status: online', cls:'ok'},
];
async function typeLines(el, lines, speed=16){
  for(const line of lines){
    const row = document.createElement('div');
    el.appendChild(row);
    for(let i=0;i<=line.t.length;i++){
      row.innerHTML = `<span class="${line.cls}">${line.t.slice(0,i)}</span><span class="caret"></span>`;
      await new Promise(r=>setTimeout(r, speed));
    }
    row.innerHTML = `<span class="${line.cls}">${line.t}</span>`;
    await new Promise(r=>setTimeout(r, 160));
  }
  const caretRow = document.createElement('div');
  caretRow.innerHTML = '<span class="caret"></span>';
  el.appendChild(caretRow);
}
typeLines(document.getElementById('heroTerm'), bootLines, reduceMotion ? 0 : 14);

/* ---------- Terminal section typing (on scroll into view, pure JS) ---------- */
const termLines = [
  {p:'$ whoami', o:'nendi'},
  {p:'$ focus', o:'AI · WEB · PENGEMBANGAN SOFTWARE · PROYEK DIGITAL'},
  {p:'$ current_status', o:'SEDANG MEMBANGUN...'},
];
let termTyped = false;
async function typeTerminal(){
  if(termTyped) return; termTyped = true;
  const el = document.getElementById('termBody');
  for(const line of termLines){
    const pRow = document.createElement('div');
    el.appendChild(pRow);
    for(let i=0;i<=line.p.length;i++){
      pRow.innerHTML = `<span class="prompt">${line.p.slice(0,i)}</span><span class="caret"></span>`;
      await new Promise(r=>setTimeout(r, reduceMotion?0:22));
    }
    pRow.innerHTML = `<span class="prompt">${line.p}</span>`;
    await new Promise(r=>setTimeout(r, 220));
    const oRow = document.createElement('div');
    oRow.innerHTML = `<span class="out accent">${line.o}</span>`;
    el.appendChild(oRow);
    await new Promise(r=>setTimeout(r, 320));
  }
  const caretRow = document.createElement('div');
  caretRow.innerHTML = '<span class="prompt">$ </span><span class="caret"></span>';
  el.appendChild(caretRow);
}
if(gsapAvailable){
  ScrollTrigger.create({ trigger:'#termBody', start:'top 80%', onEnter: typeTerminal });
}else{
  const termObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{ if(entry.isIntersecting) typeTerminal(); });
  }, {threshold:.4});
  termObserver.observe(document.getElementById('termBody'));
}

