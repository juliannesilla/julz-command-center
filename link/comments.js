/* ============================================================================
   Julz Review Layer — leave comments anywhere on the site.
   Self-contained, no backend. Saves to localStorage (this browser), shared
   across all pages of the site. Export / Copy gives you the full punch-list.
   Toggle the whole layer off with ?review=0 or the eye button.
   ============================================================================ */
(function () {
  if (window.__julzReview) return; window.__julzReview = true;
  var __rvQ = /[?&]review=1/.test(location.search) || /review/i.test(location.hash);
  if (__rvQ) { try{ localStorage.setItem('julz-review-mode','1'); }catch(e){} }
  var __rvOn = __rvQ || (function(){ try{ return localStorage.getItem('julz-review-mode')==='1'; }catch(e){ return false; } })();
  if (!__rvOn) return; /* sticky review mode: ?review=1 once -> stays on for this browser; X clears it */
  var KEY = 'julz-comments-v1';
  var AUTHOR = localStorage.getItem('julz-comment-author') || 'Julz';
  var page = location.pathname.replace(/.*\/site\//, '').replace(/^\//, '') || 'index.html';

  // ---- styles ----
  var css = document.createElement('style');
  css.textContent = [
    '.jrv-layer{position:absolute;top:0;left:0;width:100%;z-index:99990;pointer-events:none}',
    '.jrv-pin{position:absolute;transform:translate(-50%,-100%);pointer-events:auto;cursor:pointer;z-index:99991}',
    '.jrv-pin .dot{width:28px;height:28px;border-radius:50% 50% 50% 2px;background:#CDAD7D;color:#0E0D0C;font:700 13px/28px "Cormorant Garamond",Georgia,serif;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,.5),0 0 0 2px rgba(14,13,12,.6);transform:rotate(0);transition:transform .15s}',
    '.jrv-pin:hover .dot{transform:scale(1.12)}',
    '.jrv-pin.open .dot{background:#F3E2BE}',
    '.jrv-pop{position:absolute;top:0;left:50%;transform:translate(-50%,8px);min-width:230px;max-width:300px;background:#15120F;border:1px solid #2A241D;border-radius:12px;box-shadow:0 16px 50px rgba(0,0,0,.6);padding:12px;color:#F0EBE1;font:14px/1.5 "Cormorant Garamond",Georgia,serif;pointer-events:auto;z-index:99999}',
    '.jrv-pop textarea{width:100%;min-height:64px;resize:vertical;background:#0E0D0C;border:1px solid #2A241D;border-radius:8px;color:#F0EBE1;font:14px/1.45 "Cormorant Garamond",Georgia,serif;padding:8px;outline:none}',
    '.jrv-pop textarea:focus{border-color:#CDAD7D}',
    '.jrv-pop .meta{font:600 10px/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.08em;text-transform:uppercase;color:#A99E8E;margin-bottom:8px}',
    '.jrv-pop .body{white-space:pre-wrap;color:#E5E2DD;margin-bottom:10px}',
    '.jrv-row{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}',
    '.jrv-btn{font:700 11px/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.06em;text-transform:uppercase;padding:8px 12px;border-radius:7px;border:1px solid #2A241D;background:transparent;color:#E5E2DD;cursor:pointer;transition:.2s}',
    '.jrv-btn:hover{border-color:#CDAD7D;color:#CDAD7D}',
    '.jrv-btn.pri{background:#CDAD7D;color:#0E0D0C;border-color:#CDAD7D}',
    '.jrv-btn.pri:hover{background:#F3E2BE;color:#0E0D0C}',
    '.jrv-btn.del:hover{border-color:#C98B7A;color:#C98B7A}',
    '.jrv-bar{position:fixed;right:18px;bottom:18px;z-index:100000;display:flex;gap:8px;align-items:center;font-family:"Cormorant Garamond",Georgia,serif}',
    '.jrv-bar button{font:700 11px/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.06em;text-transform:uppercase;padding:11px 14px;border-radius:10px;border:1px solid #2A241D;background:rgba(21,18,15,.92);color:#E5E2DD;cursor:pointer;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 8px 26px rgba(0,0,0,.45);transition:.2s}',
    '.jrv-bar button:hover{border-color:#CDAD7D;color:#CDAD7D}',
    '.jrv-bar button.on{background:#CDAD7D;color:#0E0D0C;border-color:#CDAD7D}',
    '.jrv-bar .ct{background:#0E0D0C;color:#CDAD7D;border-radius:20px;padding:2px 7px;font-size:10px;margin-left:6px}',
    'body.jrv-mode, body.jrv-mode *{cursor:crosshair!important}',
    '.jrv-banner{position:fixed;top:0;left:0;right:0;z-index:100001;background:#CDAD7D;color:#0E0D0C;font:700 12px/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.04em;text-align:center;padding:9px;text-transform:uppercase}',
    '.jrv-panel{position:fixed;right:18px;bottom:72px;z-index:100000;width:330px;max-height:62vh;overflow:auto;background:#15120F;border:1px solid #2A241D;border-radius:14px;box-shadow:0 18px 60px rgba(0,0,0,.6);padding:14px;color:#F0EBE1;font:14px/1.5 "Cormorant Garamond",Georgia,serif;display:none}',
    '.jrv-panel.show{display:block}',
    '.jrv-panel h4{font:800 12px/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.14em;text-transform:uppercase;color:#CDAD7D;margin:0 0 10px}',
    '.jrv-item{border-top:1px solid #2A241D;padding:10px 0;cursor:pointer}',
    '.jrv-item:hover{color:#CDAD7D}',
    '.jrv-item .n{display:inline-block;min-width:20px;height:20px;border-radius:50%;background:#CDAD7D;color:#0E0D0C;font:700 11px/20px "Cormorant Garamond",Georgia,serif;text-align:center;margin-right:8px}',
    '.jrv-item .pg{font:600 9px/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.08em;text-transform:uppercase;color:#7A7A70;margin-left:28px}',
    '.jrv-empty{color:#A99E8E;font-style:italic;padding:8px 0}',
    '.jrv-pin.ok .dot{background:#5E8B5E;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.5),0 0 0 2px rgba(94,139,94,.55)}',
    '.jrv-btn.ok{border-color:#5E8B5E;color:#9CC79C}',
    '.jrv-btn.ok:hover{background:#5E8B5E;color:#fff;border-color:#5E8B5E}',
    '.jrv-item .n.okn{background:#5E8B5E;color:#fff}',
    '.jrv-item.done .tx{color:#8FAF8F;text-decoration:line-through;text-decoration-thickness:1px}'
  ].join('');
  document.head.appendChild(css);

  // ---- state ----
  function load(){ try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e){ return []; } }
  function save(a){ localStorage.setItem(KEY, JSON.stringify(a)); }
  var all = load();
  function pageComments(){ return all.filter(function(c){ return c.page === page; }); }
  function uid(){ return 'c' + Math.random().toString(36).slice(2, 9); }

  // ---- layer ----
  var layer = document.createElement('div'); layer.className = 'jrv-layer'; document.body.appendChild(layer);
  function sizeLayer(){ layer.style.height = document.documentElement.scrollHeight + 'px'; }
  var docW = function(){ return document.documentElement.scrollWidth; };

  var mode = false, openPop = null;

  function closePop(){ if(openPop){ openPop.remove(); openPop = null; } document.querySelectorAll('.jrv-pin.open').forEach(function(p){p.classList.remove('open');}); }

  function renderPins(){
    layer.innerHTML = ''; sizeLayer();
    var list = pageComments(); var w = docW();
    list.forEach(function(c, i){
      var pin = document.createElement('div'); pin.className = 'jrv-pin' + (c.approved ? ' ok' : '');
      pin.style.left = (c.xPct * w) + 'px'; pin.style.top = c.y + 'px';
      pin.innerHTML = '<div class="dot">' + (c.approved ? '✓' : (i + 1)) + '</div>';
      pin.addEventListener('click', function(e){ e.stopPropagation(); showComment(c, pin, i + 1); });
      layer.appendChild(pin);
    });
    updateCount();
  }

  function showComment(c, pin, num){
    closePop(); pin.classList.add('open');
    var pop = document.createElement('div'); pop.className = 'jrv-pop';
    pop.innerHTML = '<div class="meta">#' + num + ' · ' + (c.author || 'Julz') + ' · ' + new Date(c.ts).toLocaleString() + '</div>'
      + '<div class="body"></div>'
      + '<div class="jrv-row"><button class="jrv-btn ok">' + (c.approved ? 'Approved ✓ (undo)' : 'Approve ✓') + '</button><button class="jrv-btn edit">Edit</button><button class="jrv-btn del">Delete</button></div>';
    pop.querySelector('.body').textContent = c.text;
    pop.addEventListener('click', function(e){ e.stopPropagation(); });
    pop.querySelector('.del').addEventListener('click', function(){ if(!confirm('Delete this comment?')) return; all = all.filter(function(x){ return x.id !== c.id; }); save(all); closePop(); renderPins(); renderPanel(); });
    pop.querySelector('.ok').addEventListener('click', function(){ c.approved = !c.approved; save(all); closePop(); renderPins(); renderPanel(); });
    pop.querySelector('.edit').addEventListener('click', function(){ editor(c, pin); });
    pin.appendChild(pop); openPop = pop;
  }

  function editor(c, pin){
    closePop(); pin.classList.add('open');
    var pop = document.createElement('div'); pop.className = 'jrv-pop';
    pop.innerHTML = '<div class="meta">' + (c.id ? 'Edit comment' : 'New comment') + '</div>'
      + '<textarea placeholder="What should change here?"></textarea>'
      + '<div class="jrv-row"><button class="jrv-btn cancel">Cancel</button><button class="jrv-btn pri save">Save</button></div>';
    var ta = pop.querySelector('textarea'); ta.value = c.text || '';
    pop.addEventListener('click', function(e){ e.stopPropagation(); });
    pop.querySelector('.cancel').addEventListener('click', function(){ closePop(); if(!c.id) renderPins(); });
    pop.querySelector('.save').addEventListener('click', function(){
      var v = ta.value.trim(); if(!v){ return; }
      if(c.id){ c.text = v; } else { c.id = uid(); c.text = v; c.ts = Date.now(); c.author = AUTHOR; all.push(c); }
      save(all); closePop(); renderPins(); renderPanel();
    });
    pin.appendChild(pop); openPop = pop;
    setTimeout(function(){ ta.focus(); }, 30);
  }

  // ---- placing a new comment ----
  document.addEventListener('click', function(e){
    if(!mode) return;
    if(e.target.closest('.jrv-bar, .jrv-panel, .jrv-pop, .jrv-pin, .jrv-banner')) return;
    e.preventDefault(); e.stopPropagation();
    var c = { page: page, xPct: e.pageX / docW(), y: e.pageY };
    // temp pin
    var pin = document.createElement('div'); pin.className = 'jrv-pin open';
    pin.style.left = e.pageX + 'px'; pin.style.top = e.pageY + 'px';
    pin.innerHTML = '<div class="dot">+</div>'; layer.appendChild(pin);
    editor(c, pin);
  }, true);

  // ---- toolbar ----
  var bar = document.createElement('div'); bar.className = 'jrv-bar';
  bar.innerHTML = '<button class="cmt">💬 Comment</button>'
    + '<button class="list">Comments<span class="ct">0</span></button>'
    + '<button class="exp">⤓ Export</button>'
    + '<button class="copy">Copy</button>'
    + '<button class="eye" title="Hide review layer">✕</button>';
  document.body.appendChild(bar);

  var banner = null;
  function setMode(on){
    mode = on; document.body.classList.toggle('jrv-mode', on);
    bar.querySelector('.cmt').classList.toggle('on', on);
    if(on && !banner){ banner = document.createElement('div'); banner.className='jrv-banner'; banner.textContent='Comment mode — click anywhere to leave a note · press Esc to stop'; document.body.appendChild(banner); }
    if(!on && banner){ banner.remove(); banner = null; }
  }
  bar.querySelector('.cmt').addEventListener('click', function(){ setMode(!mode); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ setMode(false); closePop(); panel.classList.remove('show'); } });

  // ---- panel ----
  var panel = document.createElement('div'); panel.className = 'jrv-panel'; document.body.appendChild(panel);
  function renderPanel(){
    var list = pageComments();
    var total = all.length;
    var apr = list.filter(function(c){ return c.approved; }).length;
    var html = '<h4>Comments · this page (' + list.length + ') · approved ' + apr + '/' + list.length + '</h4>';
    if(!list.length) html += '<div class="jrv-empty">No comments on this page yet. Hit “💬 Comment”, then click anywhere.</div>';
    list.forEach(function(c, i){
      html += '<div class="jrv-item' + (c.approved ? ' done' : '') + '" data-id="' + c.id + '"><span class="n' + (c.approved ? ' okn' : '') + '">' + (c.approved ? '✓' : (i+1)) + '</span><span class="tx"></span><div class="pg">' + (c.text.length>90?'':'') + '</div></div>';
    });
    panel.innerHTML = html;
    list.forEach(function(c, i){
      var it = panel.querySelectorAll('.jrv-item')[i];
      it.querySelector('.tx').textContent = c.text.length > 90 ? c.text.slice(0,90)+'…' : c.text;
      it.addEventListener('click', function(){
        var pins = layer.querySelectorAll('.jrv-pin'); var pin = pins[i];
        if(pin){ window.scrollTo({ top: c.y - window.innerHeight/2, behavior:'smooth' }); setTimeout(function(){ showComment(c, pin, i+1); }, 350); }
      });
    });
    updateCount();
  }
  function updateCount(){ bar.querySelector('.ct').textContent = pageComments().length; }
  bar.querySelector('.list').addEventListener('click', function(){ panel.classList.toggle('show'); renderPanel(); });

  // ---- export / copy ----
  function buildMarkdown(){
    var byPage = {};
    all.forEach(function(c){ (byPage[c.page] = byPage[c.page] || []).push(c); });
    var out = '# juliannesilla.com — Julz feedback (' + all.length + ' comments)\n_' + new Date().toLocaleString() + '_\n\n';
    Object.keys(byPage).sort().forEach(function(pg){
      out += '## ' + pg + '\n';
      byPage[pg].forEach(function(c, i){
        out += (i+1) + '. ' + (c.approved ? '[APPROVED ✓] ' : '[open] ') + c.text.replace(/\n/g,' ') + '  \n   _(at ' + Math.round(c.xPct*100) + '% across, ' + Math.round(c.y) + 'px down · ' + (c.author||'Julz') + ')_\n';
      });
      out += '\n';
    });
    return out;
  }
  bar.querySelector('.exp').addEventListener('click', function(){
    if(!all.length){ alert('No comments yet — add some first.'); return; }
    var blob = new Blob([buildMarkdown()], { type: 'text/markdown' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'juliannesilla-feedback.md'; document.body.appendChild(a); a.click(); a.remove();
  });
  bar.querySelector('.copy').addEventListener('click', function(){
    if(!all.length){ alert('No comments yet — add some first.'); return; }
    var md = buildMarkdown();
    if(navigator.clipboard){ navigator.clipboard.writeText(md).then(function(){ var b=bar.querySelector('.copy'); var o=b.textContent; b.textContent='Copied ✓'; b.classList.add('on'); setTimeout(function(){ b.textContent=o; b.classList.remove('on'); }, 1400); }); }
    else { prompt('Copy your feedback:', md); }
  });
  bar.querySelector('.eye').addEventListener('click', function(){ try{ localStorage.removeItem('julz-review-mode'); }catch(e){} bar.style.display='none'; panel.classList.remove('show'); layer.style.display='none'; setMode(false); var r=document.createElement('button'); r.textContent='💬'; r.title='Show review layer'; r.style.cssText='position:fixed;right:18px;bottom:18px;z-index:100000;width:44px;height:44px;border-radius:50%;border:1px solid #2A241D;background:rgba(21,18,15,.92);color:#CDAD7D;font-size:18px;cursor:pointer'; r.onclick=function(){ r.remove(); bar.style.display='flex'; layer.style.display='block'; }; document.body.appendChild(r); });

  // ---- init ----
  function init(){ renderPins(); renderPanel(); }
  if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }
  window.addEventListener('load', function(){ setTimeout(renderPins, 400); });
  var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(renderPins, 150); });
})();
