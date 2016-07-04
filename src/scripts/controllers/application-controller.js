'use strict';

/* globals moment, firebase */

const STATE = {
  SHOW_SIGN_IN: 'show-sign-in',
  LOAD_CALENDAR: 'load-calendar'
};

class CalendarAppController {
  constructor() {
    if (!('moment' in window)) {
      throw new Error('Moment.js is required to run this app');
    }

    const firebaseConfig = {
      apiKey: "AIzaSyCv-BqXZG2PF34ho97rwU63hPUcxBC2vKs",
      authDomain: "calendar-8fc2d.firebaseapp.com",
      databaseURL: "https://calendar-8fc2d.firebaseio.com",
      storageBucket: "calendar-8fc2d.appspot.com"
    };
    firebase.initializeApp(firebaseConfig);

    this._loadingSpinner = document.querySelector('.js-loading-spinner');
    this._weekInfoComponent = document.querySelector('.js-weekinfo');
    this._weekDisplayComponent = document.querySelector('.js-weekdisplay');

    this._userModel = new window.GauntFace.UserModel();

    return this._userModel.isSignedIn()
    .then(isSignedIn => {
      if (isSignedIn) {
        this.setState(STATE.LOAD_CALENDAR);
      } else {
        this.setState(STATE.SHOW_SIGN_IN);
      }
    })
    .then(() => {
      // This is here for easy testing
      this.loaded = true;
    });
  }

  setState(newState) {
    if (newState === this._currentState ||
      this._pendingStateChange) {
      return;
    }

    this._pendingStateChange = true;

    const topLevelSections =
      document.querySelectorAll('body >  .js-top-level-section');

    let stateChangePromise;
    switch (newState) {
      case STATE.SHOW_SIGN_IN: {
        this._loadingSpinner.classList.add('u-hidden');

        stateChangePromise = this.removeCurrentScreen()
        .then(() => {
          return this.loadHTMLImport(
            '/components/screens/gf-sign-in/gf-sign-in.html');
        })
        .then(() => {
          const signInScreen = document.createElement('gf-sign-in');
          signInScreen.userModel = this._userModel;
          return this.setCurrentScreen(signInScreen);
        });
        break;
      }
      case STATE.LOAD_CALENDAR: {
        this._loadingSpinner.classList.add('u-hidden');

        stateChangePromise = this.removeCurrentScreen()
        .then(() => {
          return this.loadHTMLImport(
            '/components/screens/gf-calendar/gf-calendar.html');
        })
        .then(() => {
          const calendarScreen = document.createElement('gf-calendar');
          calendarScreen.userModel = this._userModel;
          return this.setCurrentScreen(calendarScreen);
        });

        /**

        this._weekInfoComponent.setDate(moment());
        this._weekDisplayComponent.setDate(moment());**/
        break;
      }
      default:
        throw new Error(`Unknown state given: ${newState}`);
    }

    stateChangePromise.then(() => {
      this._currentState = newState;
      this._pendingStateChange = false;
    });
  }

  initViews() {
    // this._rootElement = document.querySelector('.js-calendar-content');
    // this._rootElement.classList.remove('hidden');

    // this._drawingArea = document.querySelector('.js-drawing-display');
    // this._canvasArea = document.querySelector('.js-painting-area');
    // this._canvasContext = this._canvasArea.getContext('2d');
  }

  removeCurrentScreen() {
    return Promise.resolve();
  }

  loadHTMLImport(importPath) {
    return new Promise(resolve => {
      let link = document.createElement('link');
      link.setAttribute('rel', 'import');
      link.setAttribute('href', importPath);
      link.onload = function() {
        resolve();
      };
      document.body.appendChild(link);
    });
  }

  setCurrentScreen(newScreen) {
    const mainElement = document.querySelector('main');
    mainElement.appendChild(newScreen);

    return Promise.resolve();
  }
}

window.GauntFace = window.GauntFace || {};
window.GauntFace.CalendarApp = window.GauntFace.CalendarApp ||
  new CalendarAppController();
