import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="lexxy-editor"
export default class extends Controller {
  static targets = ["input", "editor"]
  static values = { content: String }

  async connect() {
    await this.initializeEditor()
  }

  disconnect() {
    if (this.editorInstance?.destroy) {
      this.editorInstance.destroy()
    }
    if (this._fallbackListener) {
      this.editorTarget.removeEventListener("input", this._fallbackListener)
    }
  }

  async initializeEditor() {
    try {
      const module = await import("lexxy")
      const Lexxy = module.default || module.Lexxy || module.Editor
      if (!Lexxy) throw new Error("Lexxy export not found")

      this.editorInstance = new Lexxy(this.editorTarget, {
        field: this.inputTarget,
        placeholder: this.inputTarget.dataset.placeholder || "Compose your post..."
      })

      const initialContent = this.contentValue || this.inputTarget.value
      if (initialContent) {
        if (typeof this.editorInstance.setHTML === "function") {
          this.editorInstance.setHTML(initialContent)
        } else {
          this.editorTarget.innerHTML = initialContent
        }
      }
    } catch (error) {
      console.warn("Lexxy failed to load, falling back to basic editor", error)
      this.setupFallback()
    }
  }

  setupFallback() {
    this.editorTarget.contentEditable = true
    this.editorTarget.classList.add("lexxy-fallback-editor")
    this.editorTarget.innerHTML = this.contentValue || this.inputTarget.value

    this._fallbackListener = () => {
      this.inputTarget.value = this.editorTarget.innerHTML
    }

    this.editorTarget.addEventListener("input", this._fallbackListener)
  }
}
