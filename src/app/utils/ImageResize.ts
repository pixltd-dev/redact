// ImageResize.ts
import Quill from 'quill';

class ImageResize {
  quill: any;
  options: any;
  overlay: HTMLElement | null;
  img: HTMLImageElement | null;
  startX: number;
  startWidth: number;

  constructor(quill: any, options: any) {
    this.quill = quill;
    this.options = options;
    this.overlay = null;
    this.img = null;
    this.startX = 0;
    this.startWidth = 0;

    // Bind methods to ensure correct `this` context
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleClick = this.handleClick.bind(this);

    // Listen for click events on the editor container.
    this.quill.root.addEventListener('click', this.handleClick);
  }

  // Updated click handler that checks if the click target is an image element.
  handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'IMG') {
      this.img = target as HTMLImageElement;
      this.showOverlay();
      // Optionally log for debugging
      console.log('Image clicked:', this.img);
    } else {
      this.hideOverlay();
    }
  }

  // Creates or updates the overlay with a resize handle.
  showOverlay() {
    if (!this.img) return;
    if (this.overlay) {
      this.updateOverlayPosition();
      return;
    }

    // Create the overlay container.
    this.overlay = document.createElement('div');
    this.overlay.style.position = 'absolute';
    this.overlay.style.border = '1px dashed #444';
    this.overlay.style.pointerEvents = 'none';
    document.body.appendChild(this.overlay);

    // Create and style the resize handle.
    const handle = document.createElement('div');
    handle.style.position = 'absolute';
    handle.style.width = '10px';
    handle.style.height = '10px';
    handle.style.background = '#444';
    handle.style.cursor = 'nwse-resize';
    handle.style.pointerEvents = 'auto';
    handle.className = 'ql-image-resize-handle';
    handle.addEventListener('mousedown', this.handleMouseDown);
    this.overlay.appendChild(handle);

    this.updateOverlayPosition();
  }

  // Update the overlay's position to match the image.
  updateOverlayPosition() {
    if (!this.img || !this.overlay) return;
    const rect = this.img.getBoundingClientRect();
    this.overlay.style.top = rect.top + window.pageYOffset + 'px';
    this.overlay.style.left = rect.left + window.pageXOffset + 'px';
    this.overlay.style.width = rect.width + 'px';
    this.overlay.style.height = rect.height + 'px';

    // Position the handle at the bottom-right corner.
    const handle = this.overlay.querySelector(
      '.ql-image-resize-handle'
    ) as HTMLElement;
    if (handle) {
      handle.style.bottom = '-5px';
      handle.style.right = '-5px';
    }
  }

  // Remove the overlay and clear references.
  hideOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.img = null;
  }

  // Mouse down event for the resize handle.
  handleMouseDown(e: MouseEvent) {
    e.preventDefault();
    this.startX = e.clientX;
    if (this.img) {
      this.startWidth = this.img.width;
    }
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  // Mouse move event to resize the image.
  handleMouseMove(e: MouseEvent) {
    if (!this.img) return;
    const delta = e.clientX - this.startX;
    let newWidth = this.startWidth + delta;
    newWidth = Math.max(newWidth, 50); // enforce a minimum width
    this.img.style.width = newWidth + 'px';
    this.updateOverlayPosition();
  }

  // Mouse up event to finish the resize.
  handleMouseUp() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    if (this.img) {
      const blot = Quill.find(this.img);
      if (blot) {
        // Update the blot's width so it persists
        blot.format('width', this.img.style.width);
        console.log('Updated width to:', this.img.style.width);
      }
    }
    // Remove the overlay after finishing resizing.
    this.hideOverlay();
  }

  // Cleanup method when the module is destroyed.
  destroy() {
    this.hideOverlay();
    this.quill.root.removeEventListener('click', this.handleClick);
  }
}

export default ImageResize;
