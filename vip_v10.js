
/* =====================================================
   Bila Tarım — VIP UI v10 JS helpers (non-destructive)
   Attach once at the end of body OR after existing scripts
   ===================================================== */
(function(){
  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));

  /* ---- CATEGORY TOGGLE (keeps your existing handlers safe) ---- */
  $$('.kategori').forEach(cat => {
    const header = $('.kategori-header', cat);
    const grid = $('.urunler', cat);
    const arrow = $('.ok', header || cat) || null;
    if(!header || !grid) return;

    header.addEventListener('click', (e)=>{
      const isOpen = getComputedStyle(grid).display !== 'none';
      grid.style.display = isOpen ? 'none' : 'grid';
      if(arrow){ arrow.classList.toggle('don', !isOpen); }
    }, {passive:true});
  });

  /* ---- PRODUCT MODAL: close on backdrop & ESC ---- */
  const modalRoot = document.getElementById('product-modal-root');
  if(modalRoot){
    // close on backdrop
    modalRoot.addEventListener('click', (e)=>{
      if(e.target === modalRoot){ modalRoot.style.display='none'; document.body.classList.remove('no-scroll'); }
    });
    // close on ESC
    window.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape'){ modalRoot.style.display='none'; document.body.classList.remove('no-scroll'); }
    });
    // any close button with .kapat or [data-close]
    $$('.kapat, [data-close]', modalRoot).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        modalRoot.style.display='none';
        document.body.classList.remove('no-scroll');
      });
    });
  }

  /* ---- OPEN MODAL (integrates with existing product click flow) ---- */
  // If your existing code dispatches a custom event with details, hook here:
  window.addEventListener('open-product-modal', (ev)=>{
    if(!modalRoot) return;
    modalRoot.style.display='flex';
    document.body.classList.add('no-scroll');
    // optional: update content via ev.detail
  });

  /* ---- SEARCH: TR-insensitive (İ/ı/ş/ğ etc.), highlights matches ---- */
  const sb = $('.search-box input');
  if(sb){
    const normalizeTR = (s)=>s
      .replace(/İ/g,'i').replace(/I/g,'i').replace(/ı/g,'i')
      .replace(/Ş/g,'s').replace(/ş/g,'s')
      .replace(/Ğ/g,'g').replace(/ğ/g,'g')
      .replace(/Ü/g,'u').replace(/ü/g,'u')
      .replace(/Ö/g,'o').replace(/ö/g,'o')
      .replace(/Ç/g,'c').replace(/ç/g,'c')
      .toLowerCase();

    const cards = $$('.urun');
    const names = cards.map(c=>{
      const title = c.querySelector('p')?.innerText || '';
      const subtitle = c.querySelector('p:nth-of-type(2)')?.innerText || '';
      const price = c.querySelector('p:nth-of-type(3)')?.innerText || '';
      return {el:c, raw:(title+' '+subtitle+' '+price).trim()};
    });

    const unmark = (el)=>{
      el.querySelectorAll('mark.__hl').forEach(m=>{
        const t = document.createTextNode(m.textContent);
        m.parentNode.replaceChild(t, m);
      });
    };

    const highlight = (el, q)=>{
      if(!q) return;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      const parts = [];
      while(walker.nextNode()){ parts.push(walker.currentNode); }
      parts.forEach(node=>{
        const txt = node.nodeValue;
        if(!txt) return;
        const nTxt = normalizeTR(txt);
        const idx = nTxt.indexOf(q);
        if(idx >= 0){
          const span = document.createElement('span');
          span.innerHTML = txt.substring(0,idx)
            + '<mark class="__hl" style="background:rgba(26,99,90,.35); color:#fff; padding:0 2px; border-radius:4px;">'
            + txt.substring(idx, idx+q.length)
            + '</mark>'
            + txt.substring(idx+q.length);
          node.parentNode.replaceChild(span, node);
        }
      });
    };

    sb.addEventListener('input', ()=>{
      const q = normalizeTR(sb.value.trim());
      cards.forEach((c,i)=>{
        unmark(c);
        const text = normalizeTR(names[i].raw);
        const hit = q.length ? text.indexOf(q) >= 0 : true;
        c.style.display = hit ? '' : 'none';
        if(hit && q){ highlight(c, q); }
      });
    });
  }
})();
