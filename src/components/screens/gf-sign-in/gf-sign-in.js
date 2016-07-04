'use strict';

(() => {
  const componentDoc = document.currentScript.ownerDocument;

  class GFSignIn extends HTMLElement {
    attachedCallback() {
      this._signInBtn = this.shadowRoot.querySelector('.js-sign-in');
      this._signInBtn.addEventListener('click', () => {
        if (!this.userModel) {
          console.error('ERROR: No \'userModel\' set on this screen');
          return;
        }

        if (this._isSigningIn) {
          return;
        }

        this._isSigningIn = true;

        this.userModel.signIn()
        .then(result => {
          this._isSigningIn = false;
        });
      });
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
  }

  document.registerElement('gf-sign-in', {
    prototype: GFSignIn.prototype
  });
})();
