// Shared UI behaviour: menu icon and one booking button at a time on mobile.
(function(){
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function(){
      var open = links.classList.contains('open');
      toggle.textContent = open ? '✕' : '☰';
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('menu-open', open);
    });
    links.addEventListener('click', function(e){
      if (e.target.closest('a') && links.classList.contains('open')) toggle.click();
    });
  }
  var bar = document.getElementById('stickyCta');
  if (bar && 'MutationObserver' in window) {
    var sync = function(){ document.body.classList.toggle('sticky-on', bar.classList.contains('show')); };
    new MutationObserver(sync).observe(bar, {attributes:true, attributeFilter:['class']});
    sync();
  }
})();
