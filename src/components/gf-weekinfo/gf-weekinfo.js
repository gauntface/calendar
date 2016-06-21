'use strict';

(() => {
  const componentDoc = document.currentScript.ownerDocument;

  class GFWeekInfo extends HTMLElement {
    attachedCallback() {
      this._yearElement = this.shadowRoot.querySelector('.js-weekinfo-year');
      this._monthElement = this.shadowRoot.querySelector('.js-weekinfo-month');
      this._weekNumElement = this.shadowRoot.querySelector('.js-weekinfo-weekNumber');
    }

    createdCallback() {
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

      this._yearElement.textContent = newDate.year();
      this._monthElement.textContent = newDate.format('MMMM');
      this._weekNumElement.textContent = newDate.isoWeek();
    }
  }

  document.registerElement('gf-weekinfo', {
    prototype: GFWeekInfo.prototype
  });
})();
