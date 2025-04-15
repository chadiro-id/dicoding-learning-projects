
/**
 * Observe Intersection of contact element for show and hide element footer
 */

(() => {
  
  const intersectionTargets = document.querySelectorAll(".cr-intersection-target");

  // observer option
  let options = {
    root: null,
    rootMargin: "0px",
    threshold: buildThresholdList()
  }

  /**
   * Build an array containing threshold number in range inclusive between 0.0 to 1.0
   * @param {number} [numSteps=20] number of steps.
   * @returns {number[]}
   */
  function buildThresholdList(numSteps = 20) {
    let thresholds = [];
  
    for (let i = 1.0; i <= numSteps; i++) {
      let ratio = i / numSteps;
      thresholds.push(ratio);
    }
  
    thresholds.push(0);
    return thresholds;
  }
  
  let observer = new IntersectionObserver((entries, observer) => {
    console.log("[Observe Intersection] entries length: " + entries.length);

    entries.forEach(entry => {
      console.log("[Observe Intersection] entry => ratio: " + entry.intersectionRatio);
      // Check the visibility of the element, 
      // if the intersection ratio is more or equal to 0.25,
      if (entry.intersectionRatio >= 0.25) {
        console.log("[Intersection Observer] entry => id: " + entry.target.getAttribute("id"));

        switch (entry.target.getAttribute("id")) {
          case "navbar":
          case "hero":
            let animTargets = entry.target.querySelectorAll(".cr-anim");
            animTargets.forEach(ele => {
              ele.classList.add("cr-anim--play");
            });
            break;
          case "about":
          case "contact":
            entry.target.querySelector(".cr-anim").classList.add("cr-anim--play");
            break;
          default:
            entry.target.classList.add("cr-anim--play")
            break;
        }
        
        entry.target.classList.remove("cr-intersection-target");
        observer.unobserve(entry.target);
      }
    });
  }, options);
  
  intersectionTargets.forEach(ele => {
    observer.observe(ele);
  });

})();