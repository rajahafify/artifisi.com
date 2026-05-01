import { Controller } from "@hotwired/stimulus"
import Lenis from "@studio-freight/lenis"

export default class extends Controller {
  static targets = ["layer"]

  connect() {
    this.scrollY = 0
    this.duration = 2.5
    this.rafId = null

    this.layerTargets.forEach((layer) => {
      layer.style.willChange = "transform"
    })

    this._initLenis()
    window.__parallaxController = this
  }

  _initLenis() {
    if (this.lenis) this.lenis.destroy()
    if (this.rafId) cancelAnimationFrame(this.rafId)

    this.lenis = new Lenis({
      duration: this.duration,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    })

    this.lenis.on("scroll", ({ scroll }) => {
      this.scrollY = scroll
      this.layerTargets.forEach((layer) => {
        const speed = parseFloat(layer.dataset.parallaxSpeed) || 0
        layer.style.transform = `translate3d(0, ${scroll * (speed / 1000)}px, 0)`
      })
    })

    const raf = (time) => {
      this.lenis.raf(time)
      this.rafId = requestAnimationFrame(raf)
    }
    this.rafId = requestAnimationFrame(raf)
  }

  setDuration(val) {
    this.duration = val
    this._initLenis()
  }

  disconnect() {
    window.__parallaxController = null
    if (this.lenis) {
      this.lenis.destroy()
      this.lenis = null
    }
    if (this.rafId) cancelAnimationFrame(this.rafId)
  }
}
