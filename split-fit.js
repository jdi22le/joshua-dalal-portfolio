/* Text + picture sections, laid out so neither column is left with empty space:
   - Landscape photos take a half-width column; portrait photos and videos get a column sized
     to their own shape (30-60% of the row) so they are about as tall as the text beside them.
   - Only when that range runs out is the photo trimmed to fill its box, so photos show in full
     or close to it. Videos are never trimmed.
   Clicking a project photo opens the full, uncropped image. */
(function(){
  var MIN_H = 250, MAX_H = 560, MIN_SHARE = 0.3, MAX_SHARE = 0.6, STACK_AT = 900;
  var MIN_SHOWN = 0.8;                             // a photo is never trimmed by more than 20%

  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

  function fitOne(s){
    var t = s.querySelector('.prose'), f = s.querySelector('.split-figs');
    if(!t || !f) return;
    var media = f.querySelectorAll('img, video');
    if(media.length !== 1) return;                  // two-picture sections are laid out by CSS
    var m = media[0];
    s.classList.remove('fill');
    s.style.removeProperty('grid-template-columns');
    f.style.removeProperty('--fh');
    if(window.innerWidth <= STACK_AT) return;

    var cap = f.querySelector('figcaption');
    var capH = cap ? cap.offsetHeight + 4 : 0;
    var figFirst = s.firstElementChild === f;
    var ar = parseFloat(m.getAttribute('data-ar')) || 1.33;
    var W = s.clientWidth - (parseFloat(getComputedStyle(s).columnGap) || 48);
    function cols(w){
      s.style.gridTemplateColumns = figFirst ? w + 'px minmax(0,1fr)' : 'minmax(0,1fr) ' + w + 'px';
    }

    var w = W * 0.5, h;
    if(ar < 1 || m.tagName === 'VIDEO'){
      // Portrait photos and videos: the column narrows to the picture's shape so a tall
      // picture is not blown up beside a short paragraph.
      for(var i = 0; i < 10; i++){
        cols(w);
        h = clamp(t.offsetHeight - capH, MIN_H, MAX_H);
        var next = clamp(h * ar, W * MIN_SHARE, W * MAX_SHARE);
        if(Math.abs(next - w) < 3){ w = next; break; }
        w = next;
      }
    }
    cols(w);                                       // landscape photos keep the half-width column
    h = clamp(t.offsetHeight - capH, MIN_H, MAX_H);
    if(m.tagName === 'VIDEO') return;              // video keeps its shape
    var hNat = w / ar;                             // height that shows the whole photo
    h = clamp(h, Math.max(MIN_H, hNat * MIN_SHOWN), hNat / MIN_SHOWN);
    s.classList.add('fill');
    f.style.setProperty('--fh', Math.round(h) + 'px');
  }

  function fit(){ document.querySelectorAll('.split').forEach(fitOne); }

  var timer;
  window.addEventListener('resize', function(){ clearTimeout(timer); timer = setTimeout(fit, 80); });
  window.addEventListener('load', fit);
  document.addEventListener('DOMContentLoaded', fit);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  // full-size viewer for project photos
  document.addEventListener('click', function(e){
    var img = e.target.closest('.fig img, .proj-hero img');
    if(!img) return;
    var box = document.createElement('div');
    box.className = 'viewer';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', img.alt || 'Photo');
    box.innerHTML = '<img alt=""><button type="button" aria-label="Close">&times;</button>';
    box.querySelector('img').src = img.currentSrc || img.src;
    box.querySelector('img').alt = img.alt;
    function close(){ box.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(k){ if(k.key === 'Escape') close(); }
    box.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(box);
    box.querySelector('button').focus();
  });
})();
