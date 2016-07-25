'use strict';

class BaseView extends HTMLElement {
  createdCallback() {
    this.ready = new Promise((resolve, reject) => {
      this._readyResolve = resolve;
      this._rejectReject = reject;
    })
    .then(() => {
      if (window.WebComponents.ShadowCSS) {
        window.WebComponents.ShadowCSS.shimStyling(
          this.shadowRoot, this.tagName);
      }
    });
  }

  componentLoaded() {
    this._readyResolve();
  }

  componentFailedToLoad(err) {
    this._readyReject(err);
  }
}

window.GauntFace = window.GauntFace || {};
window.GauntFace.BaseView = window.GauntFace.BaseView || BaseView;
