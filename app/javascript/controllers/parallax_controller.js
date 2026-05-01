import { Controller } from "@hotwired/stimulus"
import Lenis from "@studio-freight/lenis"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  static targets = ["layer"]

  connect() {
    // Init Lenis smooth scroll
    this.lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    })

    // Sync Lenis with ScrollTrigger
    const raf = (time) => {
      this.lenis.raf(time)
      ScrollTrigger.update()
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Apply GSAP ScrollTrigger parallax to each layer
    this.layerTargets.forEach((layer, i) => {
      const speed = parseFloat(layer.dataset.parallaxSpeed) || 100
      layer.style.willChange = "transform"

      gsap.to(layer, {
        y: speed,
        ease: "none",
        scrollTrigger: {
          trigger: this.element,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true
        }
      })
    })
  }

  disconnect() {
    // Kill all ScrollTriggers in this scope
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars.trigger === this.element) st.kill()
    })
    if (this.lenis) {
      this.lenis.destroy()
      this.lenis = null
    }
  }
}
