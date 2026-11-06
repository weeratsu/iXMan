// apply saved theme early (default: light)
(function(){let t='light';try{t=localStorage.getItem('ixman_theme')||'light'}catch(e){}document.documentElement.dataset.theme=t})();