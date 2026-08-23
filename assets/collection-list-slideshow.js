class CollectionSlideshow extends HTMLElement {
  static get observedAttributes() {
    return ['data-interval', 'data-transition-duration'];
  }

  constructor() {
    super();
    this.timer = null;
    this.index = 0;
    this.isHovered = false;
    this.isFocused = false;
    this.isIntersecting = true;
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleFocusIn = this.handleFocusIn.bind(this);
    this.handleFocusOut = this.handleFocusOut.bind(this);
    this.handleMotionPreferenceChange = this.handleMotionPreferenceChange.bind(this);
    this.handleIntersection = this.handleIntersection.bind(this);
  }

  connectedCallback() {
    this.images = Array.from(this.querySelectorAll('.collection-slideshow__image'));
    this.interval = this.getSetting('interval', 4000);
    this.transitionDuration = this.getSetting('transition-duration', 500);
    this.motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = this.motionPreference.matches;
    this.interactionContainer = this.closest('.card-wrapper') || this;

    this.interactionContainer.addEventListener('mouseenter', this.handleMouseEnter);
    this.interactionContainer.addEventListener('mouseleave', this.handleMouseLeave);
    this.interactionContainer.addEventListener('focusin', this.handleFocusIn);
    this.interactionContainer.addEventListener('focusout', this.handleFocusOut);

    if (this.motionPreference.addEventListener) {
      this.motionPreference.addEventListener('change', this.handleMotionPreferenceChange);
    } else {
      this.motionPreference.addListener(this.handleMotionPreferenceChange);
    }

    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(this.handleIntersection, { threshold: 0.01 });
      this.observer.observe(this);
    }

    this.showImage(0);
    this.updatePlayback();
  }

  disconnectedCallback() {
    this.stopPlayback();
    if (this.interactionContainer) {
      this.interactionContainer.removeEventListener('mouseenter', this.handleMouseEnter);
      this.interactionContainer.removeEventListener('mouseleave', this.handleMouseLeave);
      this.interactionContainer.removeEventListener('focusin', this.handleFocusIn);
      this.interactionContainer.removeEventListener('focusout', this.handleFocusOut);
    }

    if (this.motionPreference) {
      if (this.motionPreference.removeEventListener) {
        this.motionPreference.removeEventListener('change', this.handleMotionPreferenceChange);
      } else {
        this.motionPreference.removeListener(this.handleMotionPreferenceChange);
      }
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;

    if (name === 'data-interval') {
      this.interval = this.getSetting('interval', 4000);
    } else if (name === 'data-transition-duration') {
      this.transitionDuration = this.getSetting('transition-duration', 500);
      this.style.setProperty('--collection-slideshow-transition', `${this.transitionDuration}ms`);
    }

    this.updatePlayback();
  }

  getSetting(name, fallback) {
    const datasetKey = name.replace(/-([a-z])/g, (_, character) => character.toUpperCase());
    const value = Number.parseInt(this.dataset[datasetKey], 10);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  handleMouseEnter() {
    this.isHovered = true;
    this.updatePlayback();
  }

  handleMouseLeave() {
    this.isHovered = false;
    this.updatePlayback();
  }

  handleFocusIn() {
    this.isFocused = true;
    this.updatePlayback();
  }

  handleFocusOut(event) {
    this.isFocused = this.contains(event.relatedTarget);
    this.updatePlayback();
  }

  handleMotionPreferenceChange(event) {
    this.isReducedMotion = event.matches;
    if (this.isReducedMotion) {
      this.showImage(0);
    }
    this.updatePlayback();
  }

  handleIntersection(entries) {
    this.isIntersecting = entries[0].isIntersecting;
    this.updatePlayback();
  }

  showImage(index) {
    if (!this.images || this.images.length === 0) return;

    this.index = (index + this.images.length) % this.images.length;
    this.images.forEach((image, imageIndex) => {
      image.classList.toggle('is-active', imageIndex === this.index);
    });
  }

  updatePlayback() {
    if (
      !this.images ||
      this.images.length <= 1 ||
      this.isReducedMotion ||
      !this.isIntersecting ||
      this.isHovered ||
      this.isFocused
    ) {
      this.stopPlayback();
      return;
    }

    this.startPlayback();
  }

  startPlayback() {
    if (this.timer) return;

    this.timer = window.setTimeout(() => {
      this.timer = null;
      if (
        !this.isReducedMotion &&
        this.isIntersecting &&
        !this.isHovered &&
        !this.isFocused
      ) {
        this.showImage(this.index + 1);
        this.startPlayback();
      }
    }, this.interval);
  }

  stopPlayback() {
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

if (!customElements.get('collection-slideshow')) {
  customElements.define('collection-slideshow', CollectionSlideshow);
}
