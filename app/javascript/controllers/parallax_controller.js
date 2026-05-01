import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["layer"]
  static values = {
    speed: { type: Number, default: 0.5 }
  }

  connect() {
    this.boundScroll = this.onScroll.bind(this)
    this.raf = null
    this.lastY = 0

    this.layerTargets.forEach((layer) => {
      layer.style.willChange = "transform"
    })

    window.addEventListener("scroll", this.boundScroll, { passive: true })
    this.tick()
  }

  disconnect() {
    window.removeEventListener("scroll", this.boundScroll)
    if (this.raf) cancelAnimationFrame(this.raf)
  }

  onScroll() {
    if (!this.raf) {
      this.raf = requestAnimationFrame(() => {
        this.tick()
        this.raf = null
      })
    }
  }

  tick() {
    const scrolled = window.scrollY

    this.layerTargets.forEach((layer) => {
      const speed = parseFloat(layer.dataset.parallaxSpeed) || this.speedValue
      layer.style.transform = `translate3d(0, ${scrolled * speed}px, 0)`
    })
  }
}
