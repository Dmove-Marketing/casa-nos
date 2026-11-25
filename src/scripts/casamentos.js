// Interações do design da LP /casamentos (rolagem suave, galeria, espaços, gastronomia, lightbox).
// O envio dos formulários fica em forms.ts; o popup de WhatsApp é o do template.
import Lenis from 'lenis';

document.addEventListener('DOMContentLoaded',function(){
  'use strict';
  var reduz=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  /* ---------- rolagem suave ---------- */
  var lenis=null;
  if(!reduz){
    lenis=new Lenis({lerp:.1,anchors:false});
    (function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(0);
  }
  function irPara(alvo,off){
    if(lenis){lenis.scrollTo(alvo,{offset:off,duration:1.3});}
    else{window.scrollTo({top:alvo.getBoundingClientRect().top+window.pageYOffset+off,behavior:reduz?'auto':'smooth'});}
  }
  $$('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=a.getAttribute('href'); if(id.length<2)return;
      var alvo=$(id); if(!alvo)return;
      e.preventDefault();
      irPara(alvo,0);
    });
  });

  /* ---------- celular: títulos e textos com linhas fixas diminuem até caber na tela ---------- */
  var mqCel=window.matchMedia('(max-width:560px)');
  function ajustaTextos(){
    $$('.ajusta').forEach(function(el){
      el.style.fontSize='';
      if(!mqCel.matches||!el.offsetWidth)return;
      var fs=parseFloat(getComputedStyle(el).fontSize),n=0;
      while(el.scrollWidth>el.clientWidth+1&&n<25){fs*=.97;el.style.fontSize=fs+'px';n++;}
    });
  }
  /* títulos de seção: se algum não couber, TODOS diminuem na mesma proporção (ficam sempre do mesmo tamanho) */
  function ajustaTitulos(){
    var raiz=document.documentElement;raiz.style.removeProperty('--esc-titulos');
    if(!mqCel.matches)return;
    var menor=1;
    $$('main h2').forEach(function(h){if(h.offsetWidth&&h.scrollWidth>h.clientWidth+1)menor=Math.min(menor,h.clientWidth/h.scrollWidth);});
    if(menor<1)raiz.style.setProperty('--esc-titulos',(menor*.985).toFixed(3));
  }
  /* textos com linhas fixas no celular (hotel, gastronomia): se alguma linha não couber na tela, o texto quebra (a fonte não muda) */
  function linhasHotel(){
    $$('.hosp-texto .texto, .linhas-cel').forEach(function(p){
      p.classList.remove('quebra-livre');
      if(p.offsetWidth&&p.scrollWidth>p.clientWidth+1)p.classList.add('quebra-livre');
    });
  }
  function ajustaTudo(){ajustaTextos();ajustaTitulos();linhasHotel();}
  ajustaTudo();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(ajustaTudo);
  var tAjuste;window.addEventListener('resize',function(){clearTimeout(tAjuste);tAjuste=setTimeout(ajustaTudo,120)});

  /* ---------- aparecer ao rolar ---------- */
  if('IntersectionObserver' in window && !reduz){
    var io=new IntersectionObserver(function(ents){
      ents.forEach(function(en){if(en.isIntersecting){en.target.classList.add('visivel');io.unobserve(en.target);}});
    },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    $$('.aparece').forEach(function(el){io.observe(el)});
  }else{$$('.aparece').forEach(function(el){el.classList.add('visivel')});}

  /* ---------- espaços (celular: progresso da rolagem lateral) ---------- */
  var listaEsp=$('#espacos-lista'), barraEsp=$('#espacos-barra'), nEsp=$$('.espaco').length;
  function progressoEsp(){
    var max=listaEsp.scrollWidth-listaEsp.clientWidth, p=max>0?listaEsp.scrollLeft/max:0;
    barraEsp.style.setProperty('--p',(1/nEsp+p*(1-1/nEsp)).toFixed(3));
  }
  listaEsp.addEventListener('scroll',progressoEsp,{passive:true});progressoEsp();
  /* computador: o nome ativo troca a foto grande e mostra a legenda */
  var espacos=$$('.espaco');
  var abasEsp=$$('.espacos-abas button');
  function ativaEsp(el){espacos.forEach(function(e,i){var on=e===el;e.classList.toggle('ativo',on);$('.espaco-botao',e).setAttribute('aria-expanded',on?'true':'false');if(abasEsp[i])abasEsp[i].setAttribute('aria-pressed',on?'true':'false');});}
  /* celular: tocar numa pílula mostra o espaço e centraliza a pílula na faixa */
  abasEsp.forEach(function(b,i){b.addEventListener('click',function(){ativaEsp(espacos[i]);var c=b.parentNode;c.scrollTo({left:b.offsetLeft-(c.clientWidth-b.offsetWidth)/2,behavior:'smooth'});});});
  espacos.forEach(function(el){var b=$('.espaco-botao',el);
    b.addEventListener('click',function(){ativaEsp(el)});
    b.addEventListener('focus',function(){ativaEsp(el)});
    b.addEventListener('mouseenter',function(){if(window.matchMedia('(hover:hover)').matches)ativaEsp(el)});
  });

  /* ---------- galeria ---------- */
  var trilho=$('#galeria-trilho'), itens=$$('.galeria-item'), barraGal=$('#galeria-barra');
  var antG=$('#galeria-ant'), proxG=$('#galeria-prox');
  function estadoGaleria(){
    var max=trilho.scrollWidth-trilho.clientWidth, p=max>0?trilho.scrollLeft/max:1;
    var vis=Math.min(1,trilho.clientWidth/trilho.scrollWidth);
    barraGal.style.setProperty('--p',(vis+p*(1-vis)).toFixed(3));
    antG.disabled=trilho.scrollLeft<4; proxG.disabled=trilho.scrollLeft>max-4;
  }
  trilho.addEventListener('scroll',estadoGaleria,{passive:true});
  window.addEventListener('resize',estadoGaleria);estadoGaleria();
  /* no celular a galeria anda uma foto por vez; no computador, 70% da largura */
  function passoGal(){return window.matchMedia('(max-width:560px)').matches?itens[0].getBoundingClientRect().width+parseFloat(getComputedStyle(trilho).columnGap||0):trilho.clientWidth*.7;}
  antG.addEventListener('click',function(){trilho.scrollBy({left:-passoGal(),behavior:'smooth'})});
  proxG.addEventListener('click',function(){trilho.scrollBy({left:passoGal(),behavior:'smooth'})});
  var arr={ativo:false,x:0,sl:0,moveu:false};
  trilho.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0)return;arr.ativo=true;arr.x=e.clientX;arr.sl=trilho.scrollLeft;arr.moveu=false;});
  window.addEventListener('pointermove',function(e){if(!arr.ativo)return;var dx=e.clientX-arr.x;if(Math.abs(dx)>5){arr.moveu=true;trilho.classList.add('arrastando');}if(arr.moveu)trilho.scrollLeft=arr.sl-dx;});
  window.addEventListener('pointerup',function(){if(!arr.ativo)return;arr.ativo=false;setTimeout(function(){trilho.classList.remove('arrastando')},0);});
  var lb=$('#lightbox'), lbImg=$('img',lb), lbCont=$('.lb-contador',lb), lbAtual=0, lbLista=itens;
  /* o lightbox abre a lista de onde veio a foto: galeria ou gastronomia */
  function abreLb(i,lista){
    if(lista)lbLista=lista;
    lbAtual=(i+lbLista.length)%lbLista.length;
    var src=$('img',lbLista[lbAtual]);
    lbImg.src=src.getAttribute('src');lbImg.alt=src.alt;
    lbCont.textContent=(lbAtual+1)+' / '+lbLista.length;
    if(!lb.open){if(typeof lb.showModal==='function'){lb.showModal();}else{lb.setAttribute('open','');}if(lenis)lenis.stop();}
  }
  function fechaLb(){if(typeof lb.close==='function'){lb.close();}else{lb.removeAttribute('open');}}
  lb.addEventListener('close',function(){if(lenis)lenis.start();});
  itens.forEach(function(it,i){it.addEventListener('click',function(){if(arr.moveu)return;abreLb(i,itens)})});
  /* gastronomia: no computador, passar o mouse ou focar abre o painel e clicar amplia;
     em tela de toque, o primeiro toque abre o painel e o segundo amplia; no celular (cartões), tocar amplia */
  var gastro=$$('.gastro-item'), painelG=$('#gastro-painel'), barraGas=$('#gastro-barra');
  var temHover=window.matchMedia('(hover:hover)'), modoCartao=window.matchMedia('(max-width:900px)');
  function ativaGas(el){gastro.forEach(function(g){g.classList.toggle('ativo',g===el)});}
  gastro.forEach(function(it,i){
    it.addEventListener('mouseenter',function(){if(temHover.matches&&!modoCartao.matches)ativaGas(it)});
    it.addEventListener('focus',function(){if(!modoCartao.matches)ativaGas(it)});
    it.addEventListener('click',function(){
      if(!modoCartao.matches&&!temHover.matches&&!it.classList.contains('ativo')){ativaGas(it);return;}
      abreLb(i,gastro);
    });
  });
  function progressoGas(){
    var max=painelG.scrollWidth-painelG.clientWidth, p=max>0?painelG.scrollLeft/max:0;
    barraGas.style.setProperty('--p',(1/gastro.length+p*(1-1/gastro.length)).toFixed(3));
  }
  painelG.addEventListener('scroll',progressoGas,{passive:true});progressoGas();
  var antGa=$('#gastro-ant'), proxGa=$('#gastro-prox');
  function passoGas(){return gastro[0].getBoundingClientRect().width+parseFloat(getComputedStyle(painelG).columnGap||0);}
  function estadoGas(){var max=painelG.scrollWidth-painelG.clientWidth;antGa.disabled=painelG.scrollLeft<4;proxGa.disabled=painelG.scrollLeft>max-4;}
  painelG.addEventListener('scroll',estadoGas,{passive:true});window.addEventListener('resize',estadoGas);estadoGas();
  antGa.addEventListener('click',function(){painelG.scrollBy({left:-passoGas(),behavior:'smooth'})});
  /* miniaturas (celular): tocar leva à foto; deslizar a foto marca a miniatura certa */
  var minis=$$('.gastro-miniaturas button');
  minis.forEach(function(b,i){b.addEventListener('click',function(){painelG.scrollTo({left:i*passoGas(),behavior:'smooth'})})});
  function miniAtual(){var i=Math.round(painelG.scrollLeft/Math.max(1,passoGas()));minis.forEach(function(b,k){b.setAttribute('aria-pressed',k===i?'true':'false')})}
  painelG.addEventListener('scroll',miniAtual,{passive:true});
  proxGa.addEventListener('click',function(){painelG.scrollBy({left:passoGas(),behavior:'smooth'})});
  $('.lb-fechar',lb).addEventListener('click',fechaLb);
  $('.lb-ant',lb).addEventListener('click',function(){abreLb(lbAtual-1)});
  $('.lb-prox',lb).addEventListener('click',function(){abreLb(lbAtual+1)});
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('lightbox-corpo'))fechaLb();});
  document.addEventListener('keydown',function(e){if(!lb.open)return;if(e.key==='ArrowLeft')abreLb(lbAtual-1);if(e.key==='ArrowRight')abreLb(lbAtual+1);});
});
