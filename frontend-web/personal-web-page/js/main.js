(() => {
  const CR_NAV_MENU_ACTIVE = "cr-nav__menu--active";
  const CR_NAV_LIST_SHOW = "cr-nav__list--show";
  const CR_NAV_TOGGLE_ON = "cr-toggle-menu--on";
  
  const elementNavMenu = document.getElementById("nav__menu");
  const elementNavList = document.getElementById("nav__list");
  const elementNavToggle = document.getElementById("nav__toggle-button");

  const btnHeroAction = document.getElementById("hero__action-button");
  const btnScrollToTop = document.getElementById("btn-scroll-to-top");
  
  const navLinks = document.querySelectorAll(".cr-nav__link");

  const navAnimOptions = {
    duration: 300,
    iterations: 1
  };
  
  // Loop statement for add click event handler on each nav hyperlinks.
  // This is used to close navigation menu when in sidenav mode.
  for (let i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener("click", (evt) => {
      if (elementNavToggle.classList.contains(CR_NAV_TOGGLE_ON)) {
        closeNav();
      }
      evt.stopPropagation();
      console.log("[Nav Link] on click => target id: " + evt.target.id);
    });
  }

  // Added a click event handler to nav menu element when in sidenav mode, 
  // sidenav closed when user clicks outside the menu area.
  elementNavMenu.addEventListener("click", (evt) => {
    
    console.log("[Nav Menu] on click => target id: " + evt.target.id);
  
    if (evt.target != elementNavMenu) return;
  
    if (elementNavToggle.classList.contains(CR_NAV_TOGGLE_ON)) {
      closeNav();
    }
  
  });
  
  // When the user clicks the navigation toggle button, 
  // a condition check is performed whether the navigation is open or closed, 
  // by checking the value of the class attribute on the toggle button element, 
  // whether it contains a value with the name css selector toggle on or not. 
  // When the toggle is on, if clicked it will close the navigation menu and vice versa. 
  elementNavToggle.addEventListener("click", () => {
    if (elementNavToggle.classList.contains(CR_NAV_TOGGLE_ON)) {
      closeNav();
    }
    else {
      elementNavMenu.classList.toggle(CR_NAV_MENU_ACTIVE, true);
      elementNavToggle.classList.add(CR_NAV_TOGGLE_ON);
      const openAnimKeyframes = [
        { right: "0" }
      ];
    
      let navOpenAnim = elementNavList.animate(openAnimKeyframes, navAnimOptions);
      navOpenAnim.onfinish = () => {
        console.log("[Open Nav] Anim on finish");
        elementNavList.classList.add(CR_NAV_LIST_SHOW);
      };
    }
  });
    
  // Add click event handler for hero action button.
  btnHeroAction.addEventListener("click", () => scrollToView("about"));
    
  // Added click event handler to scroll to top button.
  btnScrollToTop.addEventListener("click", () => {
    
    // change the scrolling value on the browser window to the top left corner
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  
    // navigate page history on browser for this window
    window.history.replaceState({name : "index"}, null, "index.html");
  });
    
  /**
   * This function is used to close the navigation menu, 
   * by manipulating the value of right position property in the element style.
   */
  function closeNav() {
    
    /** value of right position on menu element box is 75% of the total viewport width. */
    const closeAnimKeyframes = [
      { right: "-75vw" }
    ];
    elementNavToggle.classList.remove(CR_NAV_TOGGLE_ON);
  
    let navCloseAnim = elementNavList.animate(closeAnimKeyframes, navAnimOptions);
    navCloseAnim.onfinish = () => {
      console.log("[Close Nav] Anim on finish");
      elementNavMenu.classList.toggle(CR_NAV_MENU_ACTIVE, false);
      elementNavList.classList.remove(CR_NAV_LIST_SHOW);
    }
  }
  
  /**
   * Useful for navigating directly to the content you want to go to.
   * @param {string} elementId 
   */
  function scrollToView(elementId) {
    let e = document.getElementById(elementId);
    if (e) {
      e.scrollIntoView();
      window.history.replaceState({name : elementId}, null, "#" + elementId);
    }
    else {
      console.warn("[Scroll To View] Element with id '" + elementId + "' not exists");
    }
  }

})();
