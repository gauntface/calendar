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
        this._quarterlyListComponent = this.shadowRoot.querySelector(
          '.js-edit-list-quarterly');

        window.firebase.database().ref(`users/${this.userModel.userID}/` +
          `2016/quarter-list/`).once('value', snapshot => {
            this._quarterlyListComponent.setData(snapshot.val());
          }
        );

        this._weekInfoComponent.setDate(moment());
        this._weekDisplayComponent.setDate(moment());
        this._quarterlyListComponent.addEventListener('list-change', event => {
          const list = event.detail;
          const filteredList = list.filter(listItem => {
            return listItem.length > 0;
          });

          // Update firebase
          if (window.firebase) {
            const quarterRef = window.firebase.database().ref(`users/` +
              `${this.userModel.userID}/2016/quarter-list/`);
            quarterRef.set(filteredList);
          } else {
            console.warn('No firebase object set - unable to save ' +
              'quarterly goals.');
          }

          if (filteredList.length >= 5 || !filteredList) {
            return;
          }

          if (filteredList[filteredList.length - 1].length > 0) {
            this._quarterlyListComponent.setNumberOfEntries(
              filteredList.length + 1);
          }
        });
      });
    }

    createdCallback() {
      this.ready = Promise.all([
        window.GauntFace.loadHTMLImport('/components/views/gf-weekinfo/' +
          'gf-weekinfo.html'),
        window.GauntFace.loadHTMLImport('/components/views/gf-weekdisplay/' +
          'gf-weekdisplay.html'),
        window.GauntFace.loadHTMLImport('/components/views/gf-drawing-canvas/' +
          'gf-drawing-canvas.html'),
        window.GauntFace.loadHTMLImport('/components/views/gf-edit-list/' +
          'gf-edit-list.html')
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
