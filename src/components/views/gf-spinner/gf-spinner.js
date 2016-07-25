'use strict';

(() => {
  const currentScript = document._currentScript || document.currentScript;
  const componentDoc = currentScript.ownerDocument;

  class GFSpinner extends window.GauntFace.BaseView {
    attachedCallback() {

    }

    createdCallback() {
      super.createdCallback();

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

      this.componentLoaded();
    }
  }

  document.registerElement('gf-spinner', {
    prototype: GFSpinner.prototype
  });
})();
