/* Sizes the picture beside each text block to match the text's height, so splits have no dead space. */
(function(){
  function fit(){
    document.querySelectorAll('.split').forEach(function(s){
      var t=s.querySelector('.prose'), f=s.querySelector('.split-figs');
      if(!t||!f) return;
      if(window.innerWidth<=900){ f.style.removeProperty('--fh'); return; }
      var cap=f.querySelector('figcaption'), c=cap?cap.offsetHeight:0;
      var h=Math.min(480, Math.max(220, t.offsetHeight - c));
      f.style.setProperty('--fh', h+'px');
    });
  }
  window.addEventListener('load', fit);
  window.addEventListener('resize', fit);
  document.addEventListener('DOMContentLoaded', fit);
})();
