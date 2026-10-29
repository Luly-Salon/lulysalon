// Pinta las familias y la carta de precios a partir de LULY_PRECIOS.
(function () {
  const familias = window.LULY_PRECIOS;
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const ico = (name, extra) => {
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'), use = document.createElementNS(ns, 'use');
    svg.setAttribute('class', 'ico' + (extra ? ' ' + extra : '')); svg.setAttribute('aria-hidden', 'true');
    use.setAttribute('href', '#' + name); svg.append(use); return svg;
  };
  const num = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
  const precio = (it) => {
    if (it.nota) return it.nota;
    const base = Array.isArray(it.p) ? `${num(it.p[0])} a ${num(it.p[1])}` : num(it.p);
    return `${base} USD`;
  };
  const minimo = (f) => Math.min(...f.grupos.filter((g) => !g.extra).flatMap((g) => g.items).filter((i) => !i.nota).map((i) => (Array.isArray(i.p) ? i.p[0] : i.p)));
  const sinAcentos = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // Familias
  const grid = $('#grid-familias');
  familias.forEach((f) => {
    const b = el('button', 'servicio'); b.type = 'button';
    const disco = el('span', 'disco'); disco.append(ico(f.icono));
    const cab = el('div', 'servicio-cab'); cab.append(el('h3', null, f.nombre), el('span', 'desde', `desde ${num(minimo(f))} USD`));
    const ver = el('span', 'ver', 'Ver precios'); ver.append(ico('arrow-right'));
    b.append(disco, cab, el('p', null, f.resumen), ver);
    b.addEventListener('click', () => { elegir(f.id); $('#precios').scrollIntoView(); });
    grid.append(b);
  });

  // Pestañas
  const tabs = $('#pestanas'), panel = $('#grupos'), vacio = $('#vacio'), buscador = $('#buscar');
  let activa = familias[0].id;
  familias.forEach((f) => {
    const t = el('button', 'tag', f.nombre); t.type = 'button'; t.setAttribute('role', 'tab'); t.id = 'tab-' + f.id;
    t.setAttribute('aria-controls', 'grupos'); t.dataset.id = f.id;
    t.addEventListener('click', () => { buscador.value = ''; elegir(f.id); });
    tabs.append(t);
  });

  function grupoCard(g, etiqueta) {
    const card = el('section', 'grupo');
    if (etiqueta) card.append(el('span', 'familia', etiqueta));
    card.append(el('h3', null, g.nombre));
    const ul = el('ul', 'lista');
    g.items.forEach((it) => {
      const li = el('li');
      const p = el('span', 'p', precio(it));
      if (it.porOnza) p.append(el('small', null, ' / onza'));
      li.append(el('span', 'n', it.n), p);
      if (it.d) li.append(el('span', 'd', it.d));
      ul.append(li);
    });
    card.append(ul);
    return card;
  }

  function elegir(id) {
    activa = id;
    tabs.querySelectorAll('.tag').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.id === id)));
    panel.setAttribute('aria-labelledby', 'tab-' + id);
    const f = familias.find((x) => x.id === id);
    panel.replaceChildren(...f.grupos.map((g) => grupoCard(g)));
    vacio.hidden = true;
  }

  buscador.addEventListener('input', () => {
    const q = sinAcentos(buscador.value.trim());
    if (!q) { elegir(activa); return; }
    tabs.querySelectorAll('.tag').forEach((t) => t.setAttribute('aria-selected', 'false'));
    const res = [];
    familias.forEach((f) => f.grupos.forEach((g) => {
      const hay = sinAcentos(g.nombre).includes(q);
      const items = hay ? g.items : g.items.filter((i) => sinAcentos(i.n + ' ' + (i.d || '')).includes(q));
      if (items.length) res.push(grupoCard({ nombre: g.nombre, items }, f.nombre));
    }));
    panel.replaceChildren(...res);
    vacio.hidden = res.length > 0;
  });

  elegir(activa);
})();
