'use strict';

/* globals moment */

(() => {
  const currentScript = document._currentScript || document.currentScript;
  const componentDoc = currentScript.ownerDocument;

  class GFCalendar extends window.GauntFace.BaseScreenController {
    attachedCallback() {
      this.ready
      .then(() => {
        this._weekInfoComponent = this.shadowRoot.querySelector(
          '.js-weekinfo');
        this._weekDisplayComponent = this.shadowRoot.querySelector(
          '.js-weekdisplay');
        this._quarterlyListComponent = this.shadowRoot.querySelector(
          '.js-edit-list-quarterly');

        this._currentMoment = moment();

        window.firebase.database().ref(`users/${this.userModel.userID}/` +
          `${this._currentMoment.year()}/quarter-list/` +
          `${this._currentMoment.quarter()}/`)
          .once('value', snapshot => {
            this._quarterlyListComponent.setData(snapshot.val());
          }
        );

        this._weekInfoComponent.setDate(this._currentMoment);
        this._weekDisplayComponent.setDate(this._currentMoment);
        this._quarterlyListComponent.addEventListener('list-change', event => {
          const list = event.detail;
          const filteredList = list.filter(listItem => {
            return listItem.length > 0;
          });

          // Update firebase
          if (window.firebase) {
            const quarterRef = window.firebase.database().ref(`users/` +
              `${this.userModel.userID}/${this._currentMoment.year()}/` +
              `quarter-list/${this._currentMoment.quarter()}/`);
            quarterRef.set(filteredList);
          } else {
            console.warn('No firebase object set - unable to save ' +
              'quarterly goals.');
          }

          this._quarterlyListComponent.updateList();
        });
      });
    }

    createdCallback() {
      super.createdCallback();

      if (!window.GauntFace.loadHTMLImport) {
        this.componentFailedToLoad(
          new Error('Unable to use GFCalendar screen since ' +
          'window.GauntFace.loadHTMLImport doesn\'t load.'));
        return;
      }

      Promise.all([
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
      })
      .then(() => {
        this.componentLoaded();
      });
    }
  }

  document.registerElement('gf-calendar', {
    prototype: GFCalendar.prototype
  });
})();
