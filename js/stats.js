/* ---------- Live GitHub stats (pure fetch, no library needed) ---------- */
(async ()=>{
  try{
    const res = await fetch('https://api.github.com/users/Ndolzz');
    if(!res.ok) throw new Error('gh user fetch failed');
    const user = await res.json();
    document.getElementById('statRepos').textContent = user.public_repos ?? '8';
    document.getElementById('statFollowers').textContent = user.followers ?? '…';

    const reposRes = await fetch('https://api.github.com/users/Ndolzz/repos?per_page=100');
    if(reposRes.ok){
      const repos = await reposRes.json();
      const totalStars = repos.reduce((a,r)=>a+(r.stargazers_count||0),0);
      document.getElementById('statStars').textContent = totalStars;
    }
  }catch(e){
    document.getElementById('statFollowers').textContent = '…';
    document.getElementById('statStars').textContent = '…';
  }
})();

