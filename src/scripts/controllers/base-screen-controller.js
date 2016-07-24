'use strict';

class BaseScreenController extends HTMLElement {
  createdCallback() {
    this.ready = new Promise((resolve, reject) => {
      this._readyResolve = resolve;
      this._rejectReject = reject;
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
window.GauntFace.BaseScreenController = window.GauntFace.BaseScreenController ||
  BaseScreenController;
