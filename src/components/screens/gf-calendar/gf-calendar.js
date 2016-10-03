'use strict';

/* globals moment */

(() => {
  const currentScript = document._currentScript || document.currentScript;
  const componentDoc = currentScript.ownerDocument;

  class GFCalendar extends window.GauntFace.BaseScreenController {
    attachedCallback() {
      this.ready = this.ready
      .then(() => {
        this._weekInfoComponent = this.querySelector(
          '.js-weekinfo');
        this._weekDisplayComponent = this.querySelector(
          '.js-weekdisplay');
        this._quarterlyListComponent = this.querySelector(
          '.js-edit-list-quarterly');
        this._drawingCanvas = this.querySelector('.js-drawing-canvas');

        this._currentMoment = moment();

        window.firebase.database().ref(`users/${this.userModel.userID}/` +
          `${this._currentMoment.year()}/quarter-list/` +
          `${this._currentMoment.quarter()}/`)
          .once('value', snapshot => {
            let value = snapshot.val();
            if (!value) {
              value = [];
            }
            this._quarterlyListComponent.setData(value);
          }
        );

        window.firebase.database().ref(`users/${this.userModel.userID}/` +
          `${this._currentMoment.year()}/week-drawings/` +
          `${this._currentMoment.isoWeek()}/`)
          .once('value', snapshot => {
            let value = snapshot.val();
            if (!value) {
              value = [];
            }
            this._drawingCanvas.setPaths(value);
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

        this._drawingCanvas.addEventListener('paths-change', event => {
          console.log('Paths Change');
          const pathList = event.detail;
          const filteredList = pathList.filter(pathItem => {
            return pathItem.getPointsOnPath().length > 0;
          });
          const pathPoints = filteredList.map(pathItem => {
            return pathItem.getPointsOnPath().map(point => {
              return point.getAsObject();
            });
          });

          // Update firebase
          if (window.firebase) {
            const weekDrawingsRef = window.firebase.database()
              .ref(`users/${this.userModel.userID}/` +
              `${this._currentMoment.year()}/week-drawings/` +
              `${this._currentMoment.isoWeek()}/`);
            weekDrawingsRef.set(pathPoints);
          } else {
            console.warn('No firebase object set - unable to save ' +
              'quarterly goals.');
          }
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
        const template = componentDoc.querySelector('template');
        if ('attachShow' in this) {
          this.appendChild(template.content.cloneNode(true));
        } else {
          this.appendChild(document.importNode(template.content, true));
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
