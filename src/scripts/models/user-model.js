'use strict';

/* globals firebase */

class UserModel {
  constructor() {
    this._userID = null;
  }

  isSignedIn() {
    if (!this._userID) {
      return false;
    }

    return true;
  }

  signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(provider)
    .then(result => {
      this._userID = result.user.uid;
    });
  }

  signOut() {
    return firebase.auth().signOut().then(function() {
      // Sign-out successful.
    }, function(error) {
      // An error happened.
    });
  }
}

window.GauntFace = window.GauntFace || {};
window.GauntFace.UserModel = window.GauntFace.UserModel || UserModel;
