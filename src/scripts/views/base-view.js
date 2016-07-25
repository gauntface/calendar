'use strict';

class BaseView extends HTMLElement {
  createdCallback() {
    this.ready = new Promise((resolve, reject) => {
      this._readyResolve = resolve;
      this._rejectReject = reject;
    })
    .then(() => {
      console.log('Shimming Styles for ' + this.tagName);
      window.WebComponents.ShadowCSS.shimStyling(this.shadowRoot, this.tagName);
    });
  }

  componentLoaded() {
    const scriptElements = this.shadowRoot.querySelectorAll('script');
    const styleElements = this.shadowRoot.querySelectorAll('style');

    if (scriptElements.length > 0) {
      console.log('Scripts: ', scriptElements);
    }

    if (styleElements.length > 0) {
      console.log('Styles: ', styleElements);
    }

    this._readyResolve();
  }

  componentFailedToLoad(err) {
    this._readyReject(err);
  }
}

window.GauntFace = window.GauntFace || {};
window.GauntFace.BaseView = window.GauntFace.BaseView || BaseView;

console.log('Hello from: window.GauntFace.BaseView');
