'use strict';

/* globals firebase */

const STATE = {
  SHOW_SIGN_IN: 'show-sign-in',
  LOAD_CALENDAR: 'load-calendar'
};

class CalendarAppController {
  constructor() {
    if (!('moment' in window)) {
      throw new Error('Moment.js is required to run this app');
    }

    if (!window.GauntFace.loadHTMLImport) {
      throw new Error('window.GauntFace.loadHTMLImport is required to ' +
        'run this app');
    }

    this._loadingSpinner = document.querySelector('.js-loading-spinner');
  }

  initialise() {
    this._userModel = new window.GauntFace.UserModel();

    const firebaseConfig = {
      apiKey: "AIzaSyCv-BqXZG2PF34ho97rwU63hPUcxBC2vKs",
      authDomain: "calendar-8fc2d.firebaseapp.com",
      databaseURL: "https://calendar-8fc2d.firebaseio.com",
      storageBucket: "calendar-8fc2d.appspot.com"
    };
    firebase.initializeApp(firebaseConfig);

    this._userModel.isSignedIn()
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

    let stateChangePromise;
    switch (newState) {
      case STATE.SHOW_SIGN_IN: {
        this._loadingSpinner.classList.add('u-hidden');

        stateChangePromise = this.removeCurrentScreen()
        .then(() => {
          return window.GauntFace.loadHTMLImport(
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
          return window.GauntFace.loadHTMLImport(
            '/components/screens/gf-calendar/gf-calendar.html');
        })
        .then(() => {
          const calendarScreen = document.createElement('gf-calendar');
          calendarScreen.userModel = this._userModel;
          return this.setCurrentScreen(calendarScreen);
        });
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

  removeCurrentScreen() {
    return Promise.resolve();
  }

  setCurrentScreen(newScreen) {
    const mainElement = document.querySelector('main');
    mainElement.appendChild(newScreen);

    return Promise.resolve();
  }
}

// Handle get variables
const getEntries = window.location.search.replace('?', '').split('&');
const getVars = {};
getEntries.forEach(entry => {
  const keyValuePair = entry.split('=');
  if (keyValuePair.length !== 2) {
    return;
  }
  getVars[keyValuePair[0]] = keyValuePair[1];
});

window.GauntFace = window.GauntFace || {};
window.GauntFace.CalendarApp = window.GauntFace.CalendarApp ||
  new CalendarAppController();

if (!getVars.testrunner) {
  window.GauntFace.CalendarApp.initialise();
}
