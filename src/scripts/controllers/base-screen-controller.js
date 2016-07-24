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

    console.log('Scripts: ', scriptElements);
    console.log('Scripts: ', styleElements);

    this._readyResolve();
  }

  componentFailedToLoad(err) {
    this._readyReject(err);
  }
}

window.GauntFace = window.GauntFace || {};
window.GauntFace.BaseScreenController = window.GauntFace.BaseScreenController ||
  BaseScreenController;
