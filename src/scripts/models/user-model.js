'use strict';

/* globals firebase */

class UserModel {
  constructor() {
    console.log('New User Model');
    this._userID = null;
  }

  get userID() {
    return this._userID;
  }

  isSignedIn() {
    if (!this._redirectCheck) {
      this._redirectCheck = firebase.auth().getRedirectResult()
      .then(result => {
        if (!result.user) {
          // Not signed in
          return;
        }

        this._userID = result.user.uid;
      });
    }

    return this._redirectCheck
    .then(() => {
      if (!this._userID) {
        return false;
      }

      return true;
    })
    .then(signedInFromRedirect => {
      if (!signedInFromRedirect) {
        return new Promise((resolve, reject) => {
          return firebase.auth().onAuthStateChanged(user => {
            if (user) {
              // User is signed in.
              console.log('User is signed in');
              this._userID = user.uid;
              return resolve(true);
            }

            // No user is signed in.
            console.log('User is NOT signed in');
            this._userID = null;
            return resolve(false);
          });
        });
      }

      return signedInFromRedirect;
    });
  }

  signIn() {
    // var provider = new firebase.auth.GoogleAuthProvider();
    // return firebase.auth().signInWithRedirect(provider);
  }

  signOut() {
    this._userID = null;

    return firebase.auth().signOut();
  }
}

window.GauntFace = window.GauntFace || {};
window.GauntFace.UserModel = window.GauntFace.UserModel || UserModel;
