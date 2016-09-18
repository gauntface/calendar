'use strict';

(() => {
  const currentScript = document._currentScript || document.currentScript;
  const componentDoc = currentScript.ownerDocument;

  class GFSignIn extends window.GauntFace.BaseScreenController {
    attachedCallback() {
      this._signInBtn = this.querySelector('.js-sign-in');
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
      super.createdCallback();

      const template = componentDoc.querySelector('template');
      if ('attachShow' in this) {
        this.appendChild(template.content.cloneNode(true));
      } else {
        this.appendChild(document.importNode(template.content, true));
      }

      this.componentLoaded();
    }
  }

  document.registerElement('gf-sign-in', {
    prototype: GFSignIn.prototype
  });
})();
