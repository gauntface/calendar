'use strict';

/* globals moment */

(() => {
  const currentScript = document._currentScript || document.currentScript;
  const componentDoc = currentScript.ownerDocument;

  class GFWeekInfo extends window.GauntFace.BaseView {
    attachedCallback() {
      this._yearElement = this.shadowRoot.querySelector('.js-weekinfo-year');
      this._monthElement = this.shadowRoot.querySelector('.js-weekinfo-month');
      this._weekNumElement = this.shadowRoot.querySelector(
        '.js-weekinfo-weekNumber');

      this._prevWeekElement = this.shadowRoot.querySelector('.js-prev-week');
      this._nextWeekElement = this.shadowRoot.querySelector('.js-next-week');
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

    setDate(newDate) {
      if (!(newDate instanceof moment)) {
        throw new Error('setDate() expects an instance of a moment -' +
          ' i.e. setDate(moment())');
      }

      this._yearElement.textContent = newDate.year();
      this._monthElement.textContent = newDate.format('MMMM');
      this._weekNumElement.textContent = newDate.isoWeek();

      const prevWeek = newDate.clone().subtract(7, 'days');
      const nextWeek = newDate.clone().add(7, 'days');

      this._prevWeekElement.href = `/${prevWeek.year()}/${prevWeek.isoWeek()}`;
      this._nextWeekElement.href = `/${nextWeek.year()}/${nextWeek.isoWeek()}`;
    }
  }

  document.registerElement('gf-weekinfo', {
    prototype: GFWeekInfo.prototype
  });
})();
