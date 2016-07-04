'use strict';

/* globals moment */

(() => {
  const componentDoc = document.currentScript.ownerDocument;

  class GFCalendar extends HTMLElement {
    constructor() {
      super();

      if (!window.GauntFace.loadHTMLImport) {
        throw new Error('Unable to use GFCalendar screen since ' +
          'window.GauntFace.loadHTMLImport doesn\'t load.');
      }
    }

    attachedCallback() {
      this.ready
      .then(() => {
        this._weekInfoComponent = this.shadowRoot.querySelector(
          '.js-weekinfo');
        this._weekDisplayComponent = this.shadowRoot.querySelector(
          '.js-weekdisplay');

        this._weekInfoComponent.setDate(moment());
        this._weekDisplayComponent.setDate(moment());
      });
    }

    createdCallback() {
      this.ready = Promise.all([
        window.GauntFace.loadHTMLImport('/components/views/gf-weekinfo/' +
          'gf-weekinfo.html'),
        window.GauntFace.loadHTMLImport('/components/views/gf-weekdisplay/' +
          'gf-weekdisplay.html'),
        window.GauntFace.loadHTMLImport('/components/views/gf-drawing-canvas/' +
          'gf-drawing-canvas.html')
      ])
      .then(() => {
        if ('attachShow' in this) {
          const root = this.attachShadow({mode: 'open'});
          const template = componentDoc.querySelector('template');
          root.appendChild(template.content.cloneNode(true));
        } else {
          const root = this.createShadowRoot();
          const template = componentDoc.querySelector('template');
          const clone = document.importNode(template.content, true);
          root.appendChild(clone);
        }
      });
    }
  }

  document.registerElement('gf-calendar', {
    prototype: GFCalendar.prototype
  });
})();
