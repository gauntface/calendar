'use strict';

/* globals firebase */

class UserModel {
  constructor() {
    this._userID = null;

    this._ready = firebase.auth().getRedirectResult()
    .then(result => {
      if (!result.user) {
        // Not signed in
        return;
      }
      this._userID = result.user.uid;
    })
    .catch(error => {
      // Handle Errors here.
      console.log(error.code, error.message);
    });
  }

  isSignedIn() {
    return this._ready
    .then(() => {
      if (!this._userID) {
        return false;
      }

      return true;
    });
  }

  signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithRedirect(provider);
  }

  signOut() {
    this._userID = null;

    return firebase.auth().signOut();
  }
}

window.GauntFace = window.GauntFace || {};
window.GauntFace.UserModel = window.GauntFace.UserModel || UserModel;
