import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["panel"]
  static values = {
    visible: { type: Boolean, default: false }
  }

  connect() {
    document.addEventListener("keydown", this._onKeydown)
  }

  disconnect() {
    document.removeEventListener("keydown", this._onKeydown)
  }

  _onKeydown = (e) => {
    if (e.key === "d" && e.ctrlKey) {
      e.preventDefault()
      this.toggle()
    }
  }

  toggle() {
    this.visibleValue = !this.visibleValue
    this.panelTarget.classList.toggle("hidden", !this.visibleValue)
  }

  updateSpeed({ currentTarget }) {
    const selector = currentTarget.dataset.layerSelector
    const layer = document.querySelector(selector)
    if (layer) {
      layer.dataset.parallaxSpeed = currentTarget.value
    }
  }

  updateLenis({ currentTarget }) {
    const pc = window.__parallaxController
    if (pc && pc.setDuration) {
      pc.setDuration(parseFloat(currentTarget.value))
    }
  }
}
