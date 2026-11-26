(function(){
  var d=document,top=d.getElementById('top'),bg=d.getElementById('burger');
  function zamknij(){top.classList.remove('open');bg.setAttribute('aria-expanded','false');bg.setAttribute('aria-label','Open menu');d.body.style.overflow=''}
  bg.addEventListener('click',function(){var o=top.classList.toggle('open');bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Close menu':'Open menu');d.body.style.overflow=o?'hidden':''});
  d.querySelectorAll('.menu a').forEach(function(a){a.addEventListener('click',zamknij)});
  d.querySelectorAll('.dd').forEach(function(b){b.addEventListener('click',function(){var li=b.parentNode,o=li.classList.toggle('open');b.setAttribute('aria-expanded',o)})});
  var tk=false;function sc(){if(tk)return;tk=true;requestAnimationFrame(function(){top.classList.toggle('sc',window.pageYOffset>8);tk=false})}addEventListener('scroll',sc,{passive:true});

  /* komunikat */
  var toast=d.getElementById('toast'),tt=null;
  function pokazT(t){toast.textContent=t;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('on')},4200)}

  /* tryb dzien / noc */
  var html=d.documentElement,th=d.querySelector('.theme'),meta=d.querySelector('meta[name="theme-color"]');
  function ustaw(t){if(t==='dark')html.setAttribute('data-theme','dark');else html.removeAttribute('data-theme');th.setAttribute('aria-pressed',t==='dark');th.setAttribute('aria-label',t==='dark'?'Day mode':'Night mode');if(meta)meta.content=t==='dark'?'#111115':'#ffffff'}
  ustaw(html.getAttribute('data-theme')==='dark'?'dark':'light');
  th.addEventListener('click',function(){var t=html.getAttribute('data-theme')==='dark'?'light':'dark';ustaw(t);try{localStorage.setItem('vp-theme',t)}catch(e){}});

  /* jezyki */
  var lm=d.querySelector('.lang-m');
  lm.querySelector('.lm').addEventListener('click',function(e){e.stopPropagation();var o=lm.classList.toggle('open');this.setAttribute('aria-expanded',o)});
  d.addEventListener('click',function(e){if(!lm.contains(e.target)){lm.classList.remove('open');lm.querySelector('.lm').setAttribute('aria-expanded','false')}});
  d.querySelectorAll('[data-lang]').forEach(function(b){b.addEventListener('click',function(){var l=b.dataset.lang;lm.classList.remove('open');if(l==='EN')return;
    var n={PL:'Polish',DE:'German',CZ:'Czech'}[l];pokazT('Preview: the '+n+' version ('+l+') will be switched on in WordPress, together with the automatic translation.')})});

  /* filmy: odtwarzacz dopiero po kliknieciu */
  d.querySelectorAll('[data-yt]').forEach(function(b){b.addEventListener('click',function(){var f=d.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+b.dataset.yt+'?autoplay=1&rel=0';f.title=b.getAttribute('aria-label').replace('Play video: ','');f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;b.innerHTML='';b.appendChild(f);b.removeAttribute('aria-label');b.style.cursor='default'},{once:true})});
  d.querySelectorAll('[data-soon]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();pokazT('The PDF will be added here once it is ready.')})});

  /* pasek telefonu */
  var mob=d.getElementById('mob'),hero=d.getElementById('start');
  if(hero&&'IntersectionObserver' in window){new IntersectionObserver(function(es){mob.classList.toggle('widac',!es[0].isIntersecting&&es[0].boundingClientRect.top<0)}).observe(hero.querySelector('.btn'))}
  else if(!hero){var ph=d.querySelector('.ph');if(ph&&'IntersectionObserver' in window)new IntersectionObserver(function(es){mob.classList.toggle('widac',!es[0].isIntersecting)}).observe(ph);else mob.classList.add('widac')}

  /* slajder */
  if(hero){
  var sl=[].slice.call(hero.querySelectorAll('.sl')),names=d.getElementById('names'),now=d.getElementById('now'),cur=0,tm=null,ruch=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  function laduj(i){var p=sl[i];if(!p||p.dataset.ok)return;p.dataset.ok=1;p.querySelectorAll('[data-srcset]').forEach(function(e){e.srcset=e.dataset.srcset;e.removeAttribute('data-srcset')});p.querySelector('img').decoding='async'}
  sl.forEach(function(p,i){var li=d.createElement('li'),b=d.createElement('button');b.type='button';b.textContent=p.dataset.name;b.setAttribute('aria-current',i===0?'true':'false');b.addEventListener('click',function(){idz(i,true)});li.appendChild(b);names.appendChild(li)});
  var nb=[].slice.call(names.querySelectorAll('button'));
  function idz(i,user){i=(i+sl.length)%sl.length;laduj(i);laduj((i+1)%sl.length);
    var p=sl[i],im=p.querySelector('img');
    function pokaz(){sl.forEach(function(s,k){s.classList.toggle('on',k===i);s.setAttribute('aria-hidden',k===i?'false':'true')});nb.forEach(function(b,k){b.setAttribute('aria-current',k===i?'true':'false')});now.textContent=p.dataset.name;cur=i}
    if(im.complete&&im.naturalWidth)pokaz();else{im.addEventListener('load',pokaz,{once:true});setTimeout(pokaz,1500)}
    if(user){hero.classList.add('stop');clearInterval(tm);tm=null}
  }
  d.getElementById('prev').addEventListener('click',function(){idz(cur-1,true)});
  d.getElementById('next').addEventListener('click',function(){idz(cur+1,true)});
  var x0=null;hero.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
  hero.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>60)idz(cur+(dx<0?1:-1),true);x0=null});
  function start(){if(!ruch){hero.classList.add('stop');return}hero.classList.add('run');laduj(1);tm=setInterval(function(){if(!d.hidden)idz(cur+1)},6500)}
  var go=false;function raz(){if(go)return;go=true;start()}
  ['pointerdown','touchstart','keydown','wheel'].forEach(function(t){addEventListener(t,raz,{once:true,passive:true})});
  function poLoad(){setTimeout(raz,7000)}
  if(d.readyState==='complete')poLoad();else addEventListener('load',poLoad);
  }

  /* tory przewijane palcem i mysza */
  d.querySelectorAll('[data-tor]').forEach(function(tor){
    var down=false,sx=0,sl0=0,moved=false;
    function step(){var k=[].filter.call(tor.children,function(c){return !c.hidden})[0];return k?k.getBoundingClientRect().width+parseFloat(getComputedStyle(tor).columnGap||20):300}
    tor.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||tor.scrollWidth<=tor.clientWidth+2)return;down=true;moved=false;sx=e.clientX;sl0=tor.scrollLeft});
    addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>4){moved=true;tor.classList.add('drag')}tor.scrollLeft=sl0-dx});
    addEventListener('pointerup',function(){if(!down)return;down=false;tor.classList.remove('drag');if(moved){var w=step();tor.scrollTo({left:Math.round(tor.scrollLeft/w)*w,behavior:'smooth'})}});
    tor.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false}},true);
    tor.addEventListener('dragstart',function(e){e.preventDefault()});
    var nav=d.querySelector('[data-nav="'+tor.id+'"]');
    function upd(){if(nav)nav.style.visibility=tor.scrollWidth>tor.clientWidth+2?'visible':'hidden'}
    tor.upd=upd;
    if(nav)nav.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){tor.scrollBy({left:step()*(+b.dataset.k),behavior:'smooth'})})});
    addEventListener('load',function(){requestAnimationFrame(upd)});addEventListener('resize',upd);
  });

  /* filtry kategorii */
  d.querySelectorAll('.chips[data-for]').forEach(function(g){
    var box=d.getElementById(g.dataset.for),bs=[].slice.call(g.querySelectorAll('button')),cnt=d.getElementById('cnt-'+g.dataset.for.replace('grid-',''));
    function filtr(f){var n=0;bs.forEach(function(c){c.setAttribute('aria-pressed',c.dataset.f===f?'true':'false')});[].forEach.call(box.children,function(c){var ok=f==='all'||(' '+c.dataset.k+' ').indexOf(' '+f+' ')>-1;c.hidden=!ok;if(ok)n++});box.scrollLeft=0;box.upd&&box.upd();if(cnt)cnt.textContent=n+(box.id==='grid-bike'?(n===1?' route':' routes'):(n===1?' place':' places'))}
    bs.forEach(function(b){b.addEventListener('click',function(){filtr(b.dataset.f)})});
    function zHash(){var h=location.hash.slice(1);if(h&&bs.some(function(b){return b.dataset.f===h}))filtr(h)}
    zHash();addEventListener('hashchange',zHash);
  });

  /* lightbox */
  var lb=d.getElementById('lb'),lbi=lb.querySelector('img'),lbc=lb.querySelector('figcaption'),grp=[],ix=0,last=null,tx0=null;
  function pokaz(){var b=grp[ix];lbi.src=b.dataset.src;lbi.alt=(b.querySelector('img')||{}).alt||'';lbc.textContent=(b.dataset.cap||'')+(grp.length>1?'  ('+(ix+1)+' / '+grp.length+')':'')}
  function otworz(b){grp=[].slice.call(d.querySelectorAll('[data-lb="'+b.dataset.lb+'"]'));ix=grp.indexOf(b);last=b;pokaz();lb.classList.add('on');d.body.style.overflow='hidden';lb.querySelector('.x').focus();var m=grp.length>1;lb.querySelector('.p').hidden=!m;lb.querySelector('.n').hidden=!m}
  function zam(){lb.classList.remove('on');d.body.style.overflow='';lbi.removeAttribute('src');if(last)last.focus()}
  function kr(k){ix=(ix+k+grp.length)%grp.length;pokaz()}
  d.querySelectorAll('[data-lb]').forEach(function(b){b.addEventListener('click',function(){otworz(b)})});
  lb.querySelector('.x').addEventListener('click',zam);lb.querySelector('.p').addEventListener('click',function(){kr(-1)});lb.querySelector('.n').addEventListener('click',function(){kr(1)});
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.tagName==='FIGURE')zam()});
  lb.addEventListener('touchstart',function(e){tx0=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){if(tx0===null)return;var k=e.changedTouches[0].clientX-tx0;if(Math.abs(k)>50&&grp.length>1)kr(k<0?1:-1);tx0=null});
  d.addEventListener('keydown',function(e){if(lb.classList.contains('on')){if(e.key==='Escape')zam();if(e.key==='ArrowRight')kr(1);if(e.key==='ArrowLeft')kr(-1)}else if(e.key==='Escape'){zamknij();lm.classList.remove('open')}});

  /* formularz pokazowy */
  var f=d.getElementById('form'),msg=d.getElementById('msg');
  if(f)f.addEventListener('submit',function(e){e.preventDefault();var ok=true;[].forEach.call(f.querySelectorAll('[required]'),function(i){var v=i.type==='checkbox'?(i.checked?'1':''):i.value.trim();var bad=!v||(i.type==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));i.setAttribute('aria-invalid',bad);if(bad&&ok){ok=false;i.focus()}});if(!ok)return;msg.hidden=false;f.reset();msg.scrollIntoView({block:'nearest',behavior:'smooth'})});

  var r=d.getElementById('rok');if(r)r.textContent=new Date().getFullYear();
})();
