'use strict';

(() => {
  const componentDoc = document.currentScript.ownerDocument;

  class GFWeekDisplay extends HTMLElement {
    attachedCallback() {

    }

    createdCallback() {
      console.log('Hello');
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
    }

    setDate(newDate) {
      if (!(newDate instanceof moment)) {
        throw new Error('setDate() expects an instance of a moment - i.e. setDate(moment())');
      }


    }
  }

  document.registerElement('gf-weekdisplay', {
    prototype: GFWeekDisplay.prototype
  });
})();
