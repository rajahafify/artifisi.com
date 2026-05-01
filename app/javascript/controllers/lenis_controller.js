import { Controller } from "@hotwired/stimulus"
import Lenis from "@studio-freight/lenis"

export default class extends Controller {
  connect() {
    this.lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true
    })

    function raf(time) {
      this.lenis.raf(time)
      requestAnimationFrame(raf.bind(this))
    }

    requestAnimationFrame(raf.bind(this))

    if (!window.__lenis) {
      window.__lenis = this.lenis
      window.dispatchEvent(new CustomEvent("lenis:ready", { detail: this.lenis }))
    }
  }

  disconnect() {
    if (this.lenis) {
      this.lenis.destroy()
      if (window.__lenis === this.lenis) {
        window.__lenis = null
      }
    }
  }
}
