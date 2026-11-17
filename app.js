(function(){
  var top=document.getElementById('top'),bg=document.getElementById('burger');
  function zamknij(){top.classList.remove('open');bg.setAttribute('aria-expanded','false');bg.setAttribute('aria-label','Open menu');document.body.style.overflow=''}
  bg.addEventListener('click',function(){var o=top.classList.toggle('open');bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Close menu':'Open menu');document.body.style.overflow=o?'hidden':''});
  document.querySelectorAll('.menu a').forEach(function(a){a.addEventListener('click',zamknij)});
  var tk=false;function sc(){if(tk)return;tk=true;requestAnimationFrame(function(){top.classList.toggle('sc',window.pageYOffset>8);tk=false})}addEventListener('scroll',sc,{passive:true});

  /* aktywna pozycja menu + pasek na telefonie */
  var links=[].slice.call(document.querySelectorAll('.menu a[href^="#"]:not(.btn)'));
  var mob=document.getElementById('mob'),hero=document.getElementById('start');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){l.classList.toggle('on',l.getAttribute('href')==='#'+e.target.id)})}})},{rootMargin:'-45% 0px -50% 0px'});
    links.forEach(function(l){var t=document.querySelector(l.getAttribute('href'));if(t)io.observe(t)});
    io.observe(hero);
    new IntersectionObserver(function(es){mob.classList.toggle('widac',!es[0].isIntersecting&&es[0].boundingClientRect.top<0)}).observe(hero.querySelector('.btn'));
  }

  /* slajder */
  var sl=[].slice.call(hero.querySelectorAll('.sl')),names=document.getElementById('names'),now=document.getElementById('now'),cur=0,tm=null,ruch=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  function laduj(i){var p=sl[i];if(!p||p.dataset.ok)return;p.dataset.ok=1;p.querySelectorAll('[data-srcset]').forEach(function(e){e.srcset=e.dataset.srcset;e.removeAttribute('data-srcset')});var im=p.querySelector('img');im.decoding='async'}
  sl.forEach(function(p,i){var li=document.createElement('li'),b=document.createElement('button');b.type='button';b.textContent=p.dataset.name;b.setAttribute('aria-current',i===0?'true':'false');b.addEventListener('click',function(){idz(i,true)});li.appendChild(b);names.appendChild(li)});
  var nb=[].slice.call(names.querySelectorAll('button'));
  function idz(i,user){i=(i+sl.length)%sl.length;laduj(i);laduj((i+1)%sl.length);
    var p=sl[i],im=p.querySelector('img');
    function pokaz(){sl.forEach(function(s,k){s.classList.toggle('on',k===i);s.setAttribute('aria-hidden',k===i?'false':'true')});nb.forEach(function(b,k){b.setAttribute('aria-current',k===i?'true':'false')});now.textContent=p.dataset.name;cur=i}
    if(im.complete&&im.naturalWidth)pokaz();else{im.addEventListener('load',pokaz,{once:true});setTimeout(pokaz,1500)}
    if(user){hero.classList.add('stop');clearInterval(tm);tm=null}
  }
  document.getElementById('prev').addEventListener('click',function(){idz(cur-1,true)});
  document.getElementById('next').addEventListener('click',function(){idz(cur+1,true)});
  var x0=null;hero.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
  hero.addEventListener('touchend',function(e){if(x0===null)return;var d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>60)idz(cur+(d<0?1:-1),true);x0=null});
  function start(){if(!ruch){hero.classList.add('stop');return}hero.classList.add('run');laduj(1);tm=setInterval(function(){if(!document.hidden)idz(cur+1)},6500)}
  var go=false;function raz(){if(go)return;go=true;start()}
  ['pointerdown','touchstart','keydown','wheel'].forEach(function(t){addEventListener(t,raz,{once:true,passive:true})});
  function poLoad(){setTimeout(raz,7000)}
  if(document.readyState==='complete')poLoad();else addEventListener('load',poLoad);

  /* tory przewijane */
  document.querySelectorAll('[data-tor]').forEach(function(tor){
    var down=false,sx=0,sl0=0,moved=false;
    function step(){var k=[].filter.call(tor.children,function(c){return !c.hidden})[0];return k?k.getBoundingClientRect().width+parseFloat(getComputedStyle(tor).columnGap||20):300}
    tor.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||tor.scrollWidth<=tor.clientWidth+2)return;down=true;moved=false;sx=e.clientX;sl0=tor.scrollLeft});
    addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>4){moved=true;tor.classList.add('drag')}tor.scrollLeft=sl0-dx});
    addEventListener('pointerup',function(){if(!down)return;down=false;tor.classList.remove('drag');if(moved){var w=step();tor.scrollTo({left:Math.round(tor.scrollLeft/w)*w,behavior:'smooth'})}});
    tor.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false}},true);
    tor.addEventListener('dragstart',function(e){e.preventDefault()});
    var nav=document.querySelector('[data-nav="'+tor.id+'"]');
    function upd(){if(nav)nav.style.visibility=tor.scrollWidth>tor.clientWidth+2?'visible':'hidden'}
    tor.upd=upd;
    if(nav)nav.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){tor.scrollBy({left:step()*(+b.dataset.k),behavior:'smooth'})})});
    addEventListener('load',function(){requestAnimationFrame(upd)});addEventListener('resize',upd);
  });

  /* filtr polecanych */
  var cards=document.getElementById('cards'),chips=[].slice.call(document.querySelectorAll('.chips button'));
  chips.forEach(function(b){b.addEventListener('click',function(){var f=b.dataset.f;chips.forEach(function(c){c.setAttribute('aria-pressed',c===b?'true':'false')});[].forEach.call(cards.children,function(c){c.hidden=!(f==='all'||c.dataset.k===f)});cards.scrollLeft=0;cards.upd&&cards.upd()})});

  /* lightbox */
  var lb=document.getElementById('lb'),lbi=lb.querySelector('img'),lbc=lb.querySelector('figcaption'),grp=[],ix=0,last=null,tx0=null;
  function pokaz(){var b=grp[ix];lbi.src=b.dataset.src;lbi.alt=(b.querySelector('img')||{}).alt||'';lbc.textContent=b.dataset.cap+(grp.length>1?'  ('+(ix+1)+' / '+grp.length+')':'')}
  function otworz(b){grp=[].slice.call(document.querySelectorAll('[data-lb="'+b.dataset.lb+'"]'));ix=grp.indexOf(b);last=b;pokaz();lb.classList.add('on');document.body.style.overflow='hidden';lb.querySelector('.x').focus();var m=grp.length>1;lb.querySelector('.p').hidden=!m;lb.querySelector('.n').hidden=!m}
  function zam(){lb.classList.remove('on');document.body.style.overflow='';lbi.removeAttribute('src');if(last)last.focus()}
  function kr(d){ix=(ix+d+grp.length)%grp.length;pokaz()}
  document.querySelectorAll('[data-lb]').forEach(function(b){b.addEventListener('click',function(){otworz(b)})});
  lb.querySelector('.x').addEventListener('click',zam);lb.querySelector('.p').addEventListener('click',function(){kr(-1)});lb.querySelector('.n').addEventListener('click',function(){kr(1)});
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.tagName==='FIGURE')zam()});
  lb.addEventListener('touchstart',function(e){tx0=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){if(tx0===null)return;var d=e.changedTouches[0].clientX-tx0;if(Math.abs(d)>50&&grp.length>1)kr(d<0?1:-1);tx0=null});
  document.addEventListener('keydown',function(e){if(lb.classList.contains('on')){if(e.key==='Escape')zam();if(e.key==='ArrowRight')kr(1);if(e.key==='ArrowLeft')kr(-1)}else if(e.key==='Escape')zamknij()});

  /* formularz pokazowy */
  var f=document.getElementById('form'),msg=document.getElementById('msg');
  f.addEventListener('submit',function(e){e.preventDefault();var ok=true;[].forEach.call(f.querySelectorAll('[required]'),function(i){var v=i.type==='checkbox'?(i.checked?'1':''):i.value.trim();var bad=!v||(i.type==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));i.setAttribute('aria-invalid',bad);if(bad&&ok){ok=false;i.focus()}});if(!ok)return;msg.hidden=false;f.reset();msg.scrollIntoView({block:'nearest',behavior:'smooth'})});

  var r=document.getElementById('rok');if(r)r.textContent=new Date().getFullYear();
})();
