import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["layer"]
  static values = {
    speed: { type: Number, default: 0.5 }
  }

  connect() {
    this._pending = false
    this._rafId = null

    this.layerTargets.forEach((layer) => {
      layer.style.willChange = "transform"
    })

    this._onLenisScroll = (data) => {
      this._scrollY = data.scroll
      if (!this._pending) {
        this._pending = true
        this._rafId = requestAnimationFrame(() => {
          this._pending = false
          this._rafId = null
          this._applyTransforms()
        })
      }
    }

    this._readyHandler = (e) => {
      this._lenis = e.detail
      this._lenis.on("scroll", this._onLenisScroll)
      this._scrollY = this._lenis.scroll || 0
      this._applyTransforms()
    }

    if (window.__lenis) {
      this._lenis = window.__lenis
      this._lenis.on("scroll", this._onLenisScroll)
      this._scrollY = this._lenis.scroll || 0
      this._applyTransforms()
    } else {
      window.addEventListener("lenis:ready", this._readyHandler)
    }
  }

  _applyTransforms() {
    const y = this._scrollY || 0
    this.layerTargets.forEach((layer) => {
      const speed = parseFloat(layer.dataset.parallaxSpeed) || this.speedValue
      layer.style.transform = `translate3d(0, ${y * speed}px, 0)`
    })
  }

  disconnect() {
    window.removeEventListener("lenis:ready", this._readyHandler)
    if (this._lenis) {
      this._lenis.off("scroll", this._onLenisScroll)
      this._lenis = null
    }
    if (this._rafId) {
      cancelAnimationFrame(this._rafId)
    }
  }
}
