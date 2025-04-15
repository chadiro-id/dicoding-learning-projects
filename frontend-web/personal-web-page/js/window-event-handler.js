(() => {

  const CR_NAVBAR_WITH_BORDER = "cr-navbar--with-border";
  const CR_NAV_TOGGLE_ON = "cr-toggle-menu--on";
  const CR_SCROLL_TO_TOP_HIDDEN = "cr-scroll-to-top--hidden";
  
  const elementNavbar = document.getElementById("navbar");
  const elementNavToggle = document.getElementById("nav__toggle-button");
  const btnScrollToTop = document.getElementById("btn-scroll-to-top");

  // Declare the previous scroll value for comparison.
  let prevScrollPos = 0;
  let timeout;
  function windowScrollEventHandler() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      // Check the side navigation mode, 
      // if the menu is open, abort script execution.
      if (elementNavToggle.classList.contains(CR_NAV_TOGGLE_ON)) return;
      
      if (window.scrollY > prevScrollPos) {
        elementNavbar.style.top = -elementNavbar.offsetHeight + "px";
        elementNavbar.classList.toggle(CR_NAVBAR_WITH_BORDER, false);
        btnScrollToTop.classList.toggle(CR_SCROLL_TO_TOP_HIDDEN, true);
      }
      else {
        elementNavbar.style.top = "0";
        elementNavbar.classList.toggle(CR_NAVBAR_WITH_BORDER, window.scrollY > elementNavbar.offsetHeight);
        if (window.scrollY < (window.innerHeight * 1.5)) {
          btnScrollToTop.classList.add(CR_SCROLL_TO_TOP_HIDDEN);
        }
        else {
          btnScrollToTop.classList.remove(CR_SCROLL_TO_TOP_HIDDEN);
        }
      }
      prevScrollPos = window.scrollY;
    }, 1); // Debounce scroll event 1ms
  }
  window.addEventListener("scroll", windowScrollEventHandler);
})();