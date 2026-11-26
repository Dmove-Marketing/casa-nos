// Interações da home (design "index" do Claude Design): rolagem suave, hero em onda, menu, lightbox,
// gastronomia e animações com GSAP. O formulário é o padrão Dmove (forms.ts); o WhatsApp é o popup do template.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var html = document.documentElement;
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temLibs = true; /* GSAP, ScrollTrigger e Lenis vêm do npm */
  var anima = temLibs && !reduz;
  var nav = document.getElementById('nav');
  var lenis = null;

  /* ---------- rolagem suave ---------- */
  if (anima) {
    html.classList.add('anima');
    gsap.registerPlugin(ScrollTrigger);
    lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    html.classList.remove('com-abertura');
  }

  function navFim() { return nav.getBoundingClientRect().bottom; }

  /* ---------- links internos: em distâncias longas salta para perto e chega deslizando ---------- */
  function irPara(alvo) {
    var el = alvo === '#topo' ? document.body : document.querySelector(alvo);
    if (!el) return;
    var y = alvo === '#topo' ? 0 : el.getBoundingClientRect().top + window.scrollY - 0;
    if (!lenis) { window.scrollTo({ top: y, behavior: reduz ? 'auto' : 'smooth' }); return; }
    var dist = y - window.scrollY;
    if (Math.abs(dist) > window.innerHeight * 1.6) {
      lenis.scrollTo(y - Math.sign(dist) * window.innerHeight * 0.6, { immediate: true });
    }
    lenis.scrollTo(y, { duration: 0.9 });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var alvo = a.getAttribute('href');
      if (alvo.length < 2) return;
      e.preventDefault();
      var tipo = a.getAttribute('data-tipo');
      if (tipo) { var campo = document.querySelector('#contato select[name="tipo_evento"]'); if (campo && !campo.value) { campo.value = tipo; campo.dispatchEvent(new Event('change', { bubbles: true })); } }
      if (menu.classList.contains('aberto')) { fecharMenu(); setTimeout(function () { irPara(alvo); }, 60); }
      else irPara(alvo);
    });
  });

  /* ---------- títulos com linhas fixas no celular: diminui a fonte se não couber ---------- */
  function ajustaTitulos() {
    document.querySelectorAll('.titulo-secao, .hero-titulo').forEach(function (t) {
      t.style.fontSize = '';
      if (window.innerWidth > 900) return;
      var tam = parseFloat(getComputedStyle(t).fontSize), limite = 0;
      function estoura() {
        if (t.scrollWidth > t.clientWidth + 1) return true;
        return Array.prototype.some.call(t.querySelectorAll('.l'), function (l) { return l.scrollWidth > l.clientWidth + 1; });
      }
      while (estoura() && limite++ < 30) { tam -= 0.5; t.style.fontSize = tam + 'px'; }
    });
  }
  ajustaTitulos();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustaTitulos);
  window.addEventListener('resize', ajustaTitulos);

  /* ---------- hero no desktop: a cena (ondas + janela da foto) tem a mesma proporção em qualquer tela ----------
     escala única k = menor entre largura/1440 e altura/900; as ondas ficam presas à esquerda e logo abaixo do botão,
     e a foto ocupa o resto da tela até embaixo */
  var PERFIL_D = [371,369,367,366,366,366,366,367,368,370,372,375,378,382,386,390,395,400,405,411,416,421,426,431,435,438,441,444,445,445,444,442,439,435,430,430,498,495,493,490,487,485,482,479,477,474,472,470,467,465,463,462,460,458,457,456,455,454,454,454,454,454,454,455,456,458,460,462,464,467,470,474,478,483,487,493,499,504,509,514,518,522,525,528,531,533,535,537,539,541,542,544,545,546,547,548,548,549,550,550,550,551,551,551,552,552,552,552,552,552,552,552,552,552,552,552,552,552,552,552,552,552,552,552,552,552,552,552,552,552,552,552,552]; /* topo das ondas e da borda da foto a cada 20 unidades, de x = -40 em diante */
  var cenaD = { ox: 720, oy: 900 };
  function topoEntre(a, b) {
    var i0 = Math.max(0, Math.floor((a + 40) / 20)), i1 = Math.min(PERFIL_D.length - 1, Math.ceil((b + 40) / 20)), m = Infinity;
    for (var i = i0; i <= i1; i++) m = Math.min(m, PERFIL_D[i]);
    return m;
  }
  function colocaCena() {
    var svg = document.querySelector('.hero-cena-d');
    if (!svg || getComputedStyle(svg).display === 'none') return;
    var r = svg.getBoundingClientRect(), W = r.width, H = r.height;
    if (!W || !H) return;
    var k = Math.min(W / 1440, H / 900), vw = W / k, vh = H / k;
    var texto = document.querySelector('.hero-texto'), acao = document.querySelector('.hero-acao');
    var rb = acao.querySelector('.botao').getBoundingClientRect();
    var fimAcao = texto.offsetTop + acao.offsetTop + acao.offsetHeight;
    var y0 = Math.min(
      topoEntre(0, vw) - (fimAcao + 24 * k) / k,
      topoEntre((rb.left - r.left) / k - 40, (rb.right - r.left) / k + 40) - (fimAcao + 52 * k) / k
    );
    svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    svg.setAttribute('viewBox', '0 ' + y0.toFixed(1) + ' ' + vw.toFixed(1) + ' ' + vh.toFixed(1));
    var foto = svg.querySelector('.janela-foto');
    foto.setAttribute('y', (y0 - 20).toFixed(1));
    foto.setAttribute('width', (vw + 80).toFixed(1));
    foto.setAttribute('height', (vh + 40).toFixed(1));
    cenaD.ox = vw / 2; cenaD.oy = y0 + vh;
  }
  colocaCena();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(colocaCena);
  window.addEventListener('resize', colocaCena);
  window.addEventListener('load', colocaCena);

  /* ---------- hero no celular: as ondas ficam sempre abaixo do botão e a foto ocupa o resto da tela ---------- */
  var PERFIL_M = [304,304,302,302,302,301,300,300,300,300,300,300,301,301,302,302,304,304,306,307,308,310,312,313,315,317,319,321,323,325,328,330,332,334,336,338,340,342,344,346,348,349,350,352,352,353,354,354,354,354,352,352,351,350,348,346,344,343,344,370,369,367,366,365,363,362,361,360,360,359,359,358,358,358,358,359,359,360,361,362,363,365,367,368,371,373,376,376,376,376,376]; /* topo das ondas e da borda da foto a cada 5 unidades, de x = -20 em diante */
  var cenaM = { ox: 195, oy: 844, desce: 230 };
  function topoEntreM(a, b) {
    var i0 = Math.max(0, Math.floor((a + 20) / 5)), i1 = Math.min(PERFIL_M.length - 1, Math.ceil((b + 20) / 5)), m = Infinity;
    for (var i = i0; i <= i1; i++) m = Math.min(m, PERFIL_M[i]);
    return m;
  }
  function colocaCenaM() {
    var svg = document.querySelector('.hero-cena-m');
    if (!svg || getComputedStyle(svg).display === 'none') return;
    var r = svg.getBoundingClientRect(), W = r.width, H = r.height;
    if (!W || !H) return;
    var k = W / 390, vw = 390, vh = H / k;
    var texto = document.querySelector('.hero-texto'), acao = document.querySelector('.hero-acao');
    var rb = acao.querySelector('.botao').getBoundingClientRect();
    var fimAcao = texto.offsetTop + acao.offsetTop + acao.offsetHeight;
    var y0 = Math.min(
      topoEntreM(0, vw) - (fimAcao + 18 * k) / k,
      topoEntreM((rb.left - r.left) / k - 12, (rb.right - r.left) / k + 12) - (fimAcao + 30 * k) / k
    );
    svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    svg.setAttribute('viewBox', '0 ' + y0.toFixed(1) + ' ' + vw + ' ' + vh.toFixed(1));
    var foto = svg.querySelector('.janela-foto');
    foto.setAttribute('y', (y0 - 20).toFixed(1));
    var hb = Math.max(904, vh + 40);
    foto.setAttribute('height', hb.toFixed(1));
    cenaM.ox = vw / 2; cenaM.oy = y0 + vh;
    /* no início, a capela e a casa (por volta de 45% da altura da foto) ficam no meio da janela aberta abaixo do botão */
    var rh = Math.max(hb, 410 / (1200 / 2800)), topoFoto = y0 - 20 + (hb - rh) / 2;
    var janelaTopo = y0 + fimAcao / k + 60, alvo = (janelaTopo + y0 + vh) / 2;
    cenaM.desce = Math.max(0, Math.min(260, alvo - (topoFoto + 0.45 * rh)));
  }
  colocaCenaM();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(colocaCenaM);
  window.addEventListener('resize', colocaCenaM);
  window.addEventListener('load', colocaCenaM);

  /* ---------- menu do celular ---------- */
  var menu = document.getElementById('menu-celular');
  var botaoMenu = nav.querySelector('.nav-menu');
  function abrirMenu() { menu.classList.add('aberto'); menu.setAttribute('aria-hidden', 'false'); botaoMenu.setAttribute('aria-expanded', 'true'); botaoMenu.querySelector('.rot-menu').textContent = 'Fechar'; nav.classList.add('menu-aberto'); if (lenis) lenis.stop(); }
  function fecharMenu() { menu.classList.remove('aberto'); menu.setAttribute('aria-hidden', 'true'); botaoMenu.setAttribute('aria-expanded', 'false'); botaoMenu.querySelector('.rot-menu').textContent = 'Menu'; nav.classList.remove('menu-aberto'); if (lenis) lenis.start(); }
  botaoMenu.addEventListener('click', function () { menu.classList.contains('aberto') ? fecharMenu() : abrirMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('aberto')) fecharMenu(); });

  /* ---------- navegação: a cápsula fica mais sólida depois do topo ---------- */
  function estadoNav() { nav.classList.toggle('solida', window.scrollY > 40); }
  if (lenis) lenis.on('scroll', estadoNav); else window.addEventListener('scroll', estadoNav, { passive: true });
  estadoNav();

  /* link ativo do menu: a seção que passa pela altura de 45% da tela (Home enquanto o hero estiver na tela) */
  var secoesMenu = ['topo', 'espaco', 'eventos', 'galeria', 'localizacao', 'contato'].map(function (id) { return document.getElementById(id); });
  var linksMenu = nav.querySelectorAll('.nav-links a');
  function marcaMenu() {
    var linha = window.innerHeight * 0.45, ativo = null;
    secoesMenu.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= linha && r.bottom > linha) ativo = s.id; });
    linksMenu.forEach(function (l) { l.setAttribute('aria-current', ativo && l.getAttribute('href') === '#' + ativo ? 'true' : 'false'); });
  }
  if (lenis) lenis.on('scroll', marcaMenu); else window.addEventListener('scroll', marcaMenu, { passive: true });
  window.addEventListener('resize', marcaMenu);
  window.addEventListener('load', marcaMenu);
  marcaMenu();

  /* ---------- galeria: lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img');
  var lbCont = lb.querySelector('.lb-contador');
  var fotos = Array.prototype.slice.call(document.querySelectorAll('#mosaico button'));
  var atual = 0, origemFoco = null;
  function doisDig(n) { return (n < 10 ? '0' : '') + n; }
  function mostrar(i) {
    atual = (i + fotos.length) % fotos.length;
    var img = fotos[atual].querySelector('img');
    lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
    lbCont.textContent = doisDig(atual + 1) + ' / ' + doisDig(fotos.length);
  }
  function abrirLb(i) { origemFoco = document.activeElement; mostrar(i); lb.classList.add('aberto'); lb.setAttribute('aria-hidden', 'false'); if (lenis) lenis.stop(); lb.querySelector('.lb-fechar').focus(); }
  function fecharLb() { lb.classList.remove('aberto'); lb.setAttribute('aria-hidden', 'true'); if (lenis) lenis.start(); if (origemFoco) origemFoco.focus(); }
  fotos.forEach(function (b, i) { b.setAttribute('aria-label', 'Ampliar foto ' + (i + 1) + ': ' + b.querySelector('img').alt); b.addEventListener('click', function () { abrirLb(i); }); });
  lb.querySelector('.lb-fechar').addEventListener('click', fecharLb);
  lb.querySelector('.lb-ant').addEventListener('click', function () { mostrar(atual - 1); });
  lb.querySelector('.lb-prox').addEventListener('click', function () { mostrar(atual + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-figura')) fecharLb(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('aberto')) return;
    if (e.key === 'Escape') fecharLb();
    if (e.key === 'ArrowLeft') mostrar(atual - 1);
    if (e.key === 'ArrowRight') mostrar(atual + 1);
  });
  var toqueX = null;
  lb.addEventListener('touchstart', function (e) { toqueX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (toqueX === null) return; var dx = e.changedTouches[0].clientX - toqueX; if (Math.abs(dx) > 40) mostrar(atual + (dx < 0 ? 1 : -1)); toqueX = null; });

  /* ---------- gastronomia no desktop: foto grande que troca sozinha + miniaturas ---------- */
  (function () {
    var gal = document.querySelector('.gastro-galeria');
    if (!gal) return;
    var figs = gal.querySelectorAll('.gastro-fotos figure'), mins = gal.querySelectorAll('.gastro-miniaturas button');
    var desk = window.matchMedia('(min-width: 901px)');
    var TEMPO = 5000, atualG = 0, timer = null, inicio = 0, resta = TEMPO, visivel = false, pausado = false;
    function agenda(ms) { clearTimeout(timer); timer = null; if (!desk.matches || reduz || !visivel || pausado) return; inicio = Date.now(); resta = ms; timer = setTimeout(function () { mostraG(atualG + 1); }, ms); }
    function mostraG(i) {
      atualG = (i + figs.length) % figs.length;
      figs.forEach(function (f, k) { f.classList.toggle('ativa', k === atualG); });
      mins.forEach(function (b, k) { b.setAttribute('aria-current', k === atualG ? 'true' : 'false'); b.classList.remove('corre'); });
      void mins[atualG].offsetWidth;
      if (!reduz) mins[atualG].classList.add('corre');
      agenda(TEMPO);
    }
    function pausa() { if (pausado) return; pausado = true; gal.classList.add('pausa'); if (timer) { clearTimeout(timer); timer = null; resta -= Date.now() - inicio; } }
    function segue() { if (!pausado) return; pausado = false; gal.classList.remove('pausa'); agenda(Math.max(400, resta)); }
    mins.forEach(function (b, k) { b.addEventListener('click', function () { mostraG(k); }); });
    gal.addEventListener('mouseenter', pausa); gal.addEventListener('mouseleave', segue);
    gal.addEventListener('focusin', pausa); gal.addEventListener('focusout', function (e) { if (!gal.contains(e.relatedTarget)) segue(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var v = en[0].isIntersecting;
        if (v && !visivel) { visivel = true; if (!pausado) mostraG(atualG); }
        else if (!v && visivel) { visivel = false; clearTimeout(timer); timer = null; mins[atualG].classList.remove('corre'); }
      }, { threshold: 0.35 }).observe(gal);
    }
  })();

  /* ---------- gastronomia no celular: barra de progresso da faixa ---------- */
  var faixa = document.querySelector('.gastro-fotos');
  var barra = document.querySelector('.gastro-barra span');
  function progressoFaixa() {
    var max = faixa.scrollWidth - faixa.clientWidth;
    var p = max > 0 ? faixa.scrollLeft / max : 0;
    barra.style.transform = 'translateX(' + (p * 400) + '%)';
  }
  faixa.addEventListener('scroll', progressoFaixa, { passive: true });
  /* setas: passam uma foto por vez */
  var gAnt = document.querySelector('.gastro-ant'), gProx = document.querySelector('.gastro-prox');
  function passoFaixa() { var f = faixa.querySelector('figure'); return f ? f.offsetWidth + 12 : faixa.clientWidth * 0.8; }
  function setasFaixa() {
    var max = faixa.scrollWidth - faixa.clientWidth;
    gAnt.disabled = faixa.scrollLeft <= 4;
    gProx.disabled = faixa.scrollLeft >= max - 4;
  }
  gAnt.addEventListener('click', function () { faixa.scrollBy({ left: -passoFaixa(), behavior: reduz ? 'auto' : 'smooth' }); });
  gProx.addEventListener('click', function () { faixa.scrollBy({ left: passoFaixa(), behavior: reduz ? 'auto' : 'smooth' }); });
  faixa.addEventListener('scroll', setasFaixa, { passive: true });
  window.addEventListener('resize', setasFaixa);
  setasFaixa();

  if (!anima) return;

  /* ================= ANIMAÇÕES ================= */
  var mm = gsap.matchMedia();

  /* abertura + entrada do hero: as ondas do logo se desenham e o título sobe */
  function entradaHero() {
    gsap.fromTo('.hero-titulo .l>span', { yPercent: 105, y: 0 }, { yPercent: 0, y: 0, duration: 1.25, ease: 'power4.out', stagger: 0.12 });
    gsap.to('.hero-acao', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.4 });
    document.querySelectorAll('.revela-rect').forEach(function (r) {
      var w = +r.getAttribute('width');
      gsap.fromTo(r, { attr: { width: 0 } }, { attr: { width: w }, duration: 1.9, ease: 'power2.inOut', delay: 0.15 });
    });
  }
  if (html.classList.contains('com-abertura')) {
    var ab = document.querySelector('.abertura');
    lenis.stop();
    gsap.timeline({ onComplete: function () { html.classList.remove('com-abertura'); ab.remove(); lenis.start(); try { sessionStorage.setItem('casanos-abertura', '1'); } catch (e) {} } })
      .to('.abertura-logo', { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power2.inOut' })
      .to('.abertura-logo', { y: -16, opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=0.25')
      .to(ab, { yPercent: -100, duration: 1, ease: 'power3.inOut' }, '-=0.15')
      .add(entradaHero, '-=0.55');
  } else {
    entradaHero();
  }

  /* hero: a janela em forma de onda (a onda do logo) se abre até a foto ocupar a tela */
  function janelaAbaixo(sel, vbW, vbH, ondaCta, ondaTitulo) {
    /* celular: as ondas começam mais abaixo sob o botão (centro) do que nas pontas: confere o botão e o título separadamente */
    var svg = document.querySelector(sel);
    var W = window.innerWidth, H = svg.getBoundingClientRect().height || window.innerHeight;
    var s = Math.max(W / vbW, H / vbH);
    function naTela(y) { return H - (vbH - y) * s; }
    var acao = document.querySelector('.hero-acao'), tit = document.querySelector('.hero-titulo');
    var base = acao.offsetParent.offsetTop;
    var fimAcao = base + acao.offsetTop + acao.offsetHeight;
    var fimTit = base + tit.offsetTop + tit.offsetHeight;
    return Math.max(0, fimAcao + 28 - naTela(ondaCta), fimTit + 28 - naTela(ondaTitulo));
  }
  function cenaHero(sel, origem, desce, desloca) {
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 0.9, invalidateOnRefresh: true } });
    if (desloca) tl.fromTo(sel, { y: desloca }, { y: 0, ease: 'power2.in', duration: 1 }, 0);
    tl.to(sel + ' .janela-forma, ' + sel + ' .janela-ondas', { scale: 5, svgOrigin: origem, ease: 'power2.in', duration: 1 }, 0)
      .to(sel + ' .janela-ondas', { opacity: 0, ease: 'none', duration: 0.3 }, 0.2)
      .to('.hero-texto', { y: -120, opacity: 0, ease: 'power1.in', duration: 0.5 }, 0.05)
      .fromTo(sel + ' .janela-foto', { y: desce }, { y: 0, ease: 'power1.inOut', duration: 1 }, 0);
  }
  ScrollTrigger.addEventListener('refreshInit', colocaCena);
  ScrollTrigger.addEventListener('refreshInit', colocaCenaM);
  mm.add('(min-width: 901px)', function () { cenaHero('.hero-cena-d', function () { return cenaD.ox + ' ' + cenaD.oy; }, 280); });
  mm.add('(max-width: 900px)', function () { cenaHero('.hero-cena-m', function () { return cenaM.ox + ' ' + cenaM.oy; }, function () { return cenaM.desce; }); });

  /* revelações gerais */
  gsap.utils.toArray('[data-revela]').forEach(function (el) {
    gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  /* números: 1983 volta no tempo, área e convidados contam */
  document.querySelectorAll('[data-conta]').forEach(function (el) {
    var de = +el.getAttribute('data-de'), para = +el.getAttribute('data-conta'), obj = { v: de };
    el.textContent = de;
    gsap.to(obj, { v: para, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: '.autoridade', start: 'top 80%', once: true }, onUpdate: function () { el.textContent = Math.round(obj.v); } });
  });
  gsap.from('.fato-sep', { scaleX: 0, opacity: 0, duration: 1, ease: 'power2.out', stagger: 0.2, scrollTrigger: { trigger: '.autoridade', start: 'top 80%', once: true } });

  /* paralaxe das fotos */
  gsap.utils.toArray('[data-paralaxe]').forEach(function (img) {
    var v = +img.getAttribute('data-paralaxe');
    gsap.fromTo(img, { yPercent: 0 }, { yPercent: v, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* manifesto: as palavras acendem com a rolagem */
  document.querySelectorAll('[data-palavras]').forEach(function (p) {
    var palavras = p.textContent.trim().split(/\s+/);
    var original = p.textContent.trim();
    p.innerHTML = '<span class="sr">' + original + '</span>' + palavras.map(function (w) { return '<span class="w" aria-hidden="true">' + w + '</span>'; }).join(' ');
  });
  /* no celular o texto já aparece aceso */
  mm.add('(min-width: 901px)', function () { gsap.fromTo('.manifesto-texto .w', { opacity: 0.22 }, { opacity: 1, ease: 'none', stagger: 0.05, scrollTrigger: { trigger: '.manifesto-texto', start: 'top 88%', end: 'bottom 80%', scrub: true } }); });
  /* fecho: a linha corre, a onda se desenha e a frase sobe palavra por palavra */
  gsap.timeline({ scrollTrigger: { trigger: '.manifesto-fecho', start: 'top 88%', once: true } })
    .fromTo('.fecho-linha', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power3.inOut' })
    .fromTo('.manifesto-fecho svg', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power2.inOut' }, 0.2)
    .fromTo('.fw>span', { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.1 }, 0.5);

  /* ambientes: cada cartão recua e escurece quando o próximo sobe por cima */
  var cartoes = gsap.utils.toArray('.amb');
  var guia = document.querySelectorAll('.ambientes-guia li');
  cartoes.forEach(function (amb, i) {
    ScrollTrigger.create({ trigger: amb, start: 'top 60%', end: 'bottom 60%', onToggle: function (st) { if (st.isActive) guia.forEach(function (g, k) { g.classList.toggle('ativo', k === i); }); } });
    if (i === cartoes.length - 1) return;
    var prox = cartoes[i + 1];
    gsap.timeline({ scrollTrigger: { trigger: prox, start: 'top bottom', end: function () { return 'top ' + (navFim() + 20) + 'px'; }, scrub: true, invalidateOnRefresh: true } })
      .to(amb.querySelector('.amb-cartao'), { scale: 0.92, ease: 'none' }, 0)
      .to(amb.querySelector('.amb-sombra'), { opacity: 0.38, ease: 'none' }, 0);
  });

  mm.add('(min-width: 901px)', function () {
    /* gastronomia: a foto se abre de baixo para cima e as miniaturas entram em seguida */
    gsap.fromTo('.gastro-fotos', { clipPath: 'inset(100% 0% 0% 0% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.3, ease: 'power3.inOut', clearProps: 'clipPath', scrollTrigger: { trigger: '.gastro-galeria', start: 'top 82%', once: true } });
    gsap.fromTo('.gastro-miniaturas button', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.06, delay: 0.5, clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '.gastro-galeria', start: 'top 82%', once: true } });

    /* galeria: a foto do centro começa ocupando a tela e se encaixa na grade */
    var mos = document.getElementById('mosaico');
    var centro = mos.querySelector('.ga-m');
    var outros = Array.prototype.filter.call(mos.children, function (b) { return b !== centro; });
    /* medidas sem transformações (offsetWidth/Height), para o refresh não somar a escala */
    /* a foto do centro cobre a tela abaixo do menu */
    /* a foto do centro cobre a tela inteira (o menu é uma cápsula flutuante) */
    function escala() { return Math.max(window.innerWidth / centro.offsetWidth, window.innerHeight / centro.offsetHeight) * 1.02; }
    /* leva o centro da foto ao centro da tela (a foto pode estar em qualquer posição da grade) */
    function deslocY() { var topoGrade = navFim() + 20; return window.innerHeight / 2 - (topoGrade + centro.offsetTop + centro.offsetHeight / 2); }
    function deslocX() { var esq = document.querySelector('.galeria-palco').getBoundingClientRect().left; return window.innerWidth / 2 - (esq + centro.offsetLeft + centro.offsetWidth / 2); }
    var tl = gsap.timeline({
      scrollTrigger: { trigger: '.galeria-palco', start: function () { return 'top ' + (navFim() + 20) + 'px'; }, end: '+=140%', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true }
    });
    tl.fromTo(centro, { scale: escala, x: deslocX, y: deslocY, borderRadius: 0 }, { scale: 1, x: 0, y: 0, borderRadius: 18, ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo(outros, { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, ease: 'power2.out', duration: 0.6, stagger: { each: 0.05, from: 'center' } }, 0.35)
      .to({}, { duration: 0.15 });
    return function () { gsap.set([centro].concat(outros), { clearProps: 'all' }); };
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
});
