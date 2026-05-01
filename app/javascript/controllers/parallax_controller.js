import { Controller } from "@hotwired/stimulus"
import Lenis from "@studio-freight/lenis"

export default class extends Controller {
  static targets = ["layer"]
  static values = {
    speed: { type: Number, default: 0.5 }
  }

  connect() {
    this.layerTargets.forEach((layer) => {
      layer.style.willChange = "transform"
    })

    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    })

    this.lenis.on("scroll", ({ scroll }) => {
      this.layerTargets.forEach((layer) => {
        const speed = parseFloat(layer.dataset.parallaxSpeed) || this.speedValue
        layer.style.transform = `translate3d(0, ${scroll * speed}px, 0)`
      })
    })

    const raf = (time) => {
      this.lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }

  disconnect() {
    if (this.lenis) {
      this.lenis.destroy()
      this.lenis = null
    }
  }
}
