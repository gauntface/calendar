'use strict';

/* globals moment, firebase */

class CalendarAppController {
  constructor() {
    if (!('moment' in window)) {
      throw new Error('Moment.js is required to run this app');
    }

    this.waitForDimensions.bind(this);
    this.onResize.bind(this);
    this._paths = [];
    this._currentPath = null;
    this._debugMode = true;

    const firebaseConfig = {
      apiKey: "AIzaSyCv-BqXZG2PF34ho97rwU63hPUcxBC2vKs",
      authDomain: "calendar-8fc2d.firebaseapp.com",
      databaseURL: "https://calendar-8fc2d.firebaseio.com",
      storageBucket: "calendar-8fc2d.appspot.com"
    };
    firebase.initializeApp(firebaseConfig);

    this.onStart();

    // this.onFBInit();

    this.loaded = true;
  }

  /** loadFBSDK() {
    window.fbAsyncInit = this.onFBInit.bind(this);
    window.checkLoginState = this.checkLoginState.bind(this);

    let id = 'facebook-jssdk';
    let fjs = document.getElementsByTagName('script')[0];
    if (document.getElementById(id)) {
      return;
    }

    let js = document.createElement('script');
    js.id = id;
    js.src = '//connect.facebook.net/en_US/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
  }

  onFBInit() {
    // cookie: enable cookies to allow the server to access
    // the session
    // xfbml: parse social plugins on this page
    FB.init({
      appId: '187245108292106',
      cookie: true,
      xfbml: false,
      version: 'v2.2'
    });

    this.checkLoginState();
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  checkLoginState() {
    FB.getLoginStatus(this.statusChangeCallback);
  }**/

  // This is called with the results from from FB.getLoginStatus().
  statusChangeCallback(response) {
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    switch (response.status) {
      case 'connected':
        this._fb.authWithCustomToken(response.authResponse.accessToken);
        break;
      default:
        break;
    }
  }

  addPath(pathDetails) {
    this._paths.push(pathDetails);
  }

  onStart() {
    console.log('CalendarController: onStart');
    this.initViews();
    /** this.waitForDimensions()
    .then(() => {
      return this.prepareDrawingEvents();
    })
    .catch(err => {
      console.error(err);
    });**/
  }

  onUpdate() {
    console.log('CalendarController: onUpdate');
  }

  onFinish() {
    console.log('CalendarController: onFinish');
  }

  initViews() {
    this._weekInfoComponent = document.querySelector('.js-weekinfo');
    this._weekInfoComponent.setDate(moment());
    this._weekDisplayComponent = document.querySelector('.js-weekdisplay');
    this._weekDisplayComponent.setDate(moment());
    // this._rootElement = document.querySelector('.js-calendar-content');
    // this._rootElement.classList.remove('hidden');

    //this._drawingArea = document.querySelector('.js-drawing-display');
    //this._canvasArea = document.querySelector('.js-painting-area');
    //this._canvasContext = this._canvasArea.getContext('2d');
  }

  waitForDimensions() {
    return new Promise(resolve => {
      let width = this._canvasArea.parentElement.offsetWidth;
      let height = this._canvasArea.parentElement.offsetHeight;

      if (width === 0 || height === 0) {
        requestAnimationFrame(this.waitForDimensions);
        return;
      }

      this._canvasArea.classList.add('is-sized');

      window.addEventListener('resize', this.onResize.bind(this));
      this.onResize();
      resolve();
    });
  }

  onResize() {
    console.log('onResize');
    let dPR = window.devicePixelRatio || 1;

    // Switch off the canvas.
    // TODO: Why?
    this._canvasArea.style.display = 'none';

    // Find out how large the parent element is.
    let width = this._canvasArea.parentElement.offsetWidth;
    let height = this._canvasArea.parentElement.offsetHeight;

    // Switch it back on.
    this._canvasArea.style.display = 'block';

    // Scale the backing store by the dPR.
    this._canvasArea.width = width * dPR;
    this._canvasArea.height = height * dPR;

    // Draw Previous Drawings
    this._paths.each(pathPoints => {
      console.log('start pen draw');
      console.log(pathPoints[0]);
      this.startPenDraw(pathPoints[0]);
      for (var i = 1; i < pathPoints.length - 1; i++) {
        console.log('draw ' + i);
        this.penMove(pathPoints[i - 1], pathPoints[i]);
      }
      console.log('end pen draw');
      this.endPenDraw(pathPoints[pathPoints.length - 1]);
    });
  }

  prepareDrawingEvents() {
    if (!window.PointerEvent) {
      // Pointer events are supported.
      throw new Error('Pointer events are required.');
    }

    let pointerStartHandler = event => {
      if (event.pointerType !== 'pen' || event.pressure === 0) {
        return;
      }

      event.preventDefault();

      let point = this.getPointFromEvent(event);
      this._currentPath = new DrawnPath();
      this._currentPath.addToPath(point);

      this.drawPathStart(point);
    };

    let pointerEndHandler = event => {
      if (event.pointerType !== 'pen') {
        return;
      }

      event.preventDefault();

      if (this._currentPath === null) {
        return;
      }

      let point = this.getPointFromEvent(event);
      this.drawPathEnd(point);
      this.drawPathBoundingBox(this._currentPath);

      this._currentPath.addToPath(point);
      this.addPath(this._currentPath);
      this._currentPath = null;
    };

    let pointerMoveHandler = event => {
      if (event.pointerType !== 'pen' || event.pressure === 0) {
        return;
      }

      event.preventDefault();

      const prevPoint = this._currentPath.getLastPoint();
      if (!prevPoint) {
        return;
      }

      let point = this.getPointFromEvent(event);
      this._currentPath.addToPath(point);

      this.drawBetweenPoints(prevPoint, point);
    };

    this._drawingArea.addEventListener('pointerdown', pointerStartHandler);

    this._drawingArea.addEventListener('pointermove', pointerMoveHandler);

    this._drawingArea.addEventListener('pointerup', pointerEndHandler);

    this._drawingArea.addEventListener('pointerenter', pointerStartHandler);

    this._drawingArea.addEventListener('pointerleave', pointerEndHandler);
  }

  getPointFromEvent(event) {
    let dPR = window.devicePixelRatio || 1;

    return new Point(
      event.offsetX * dPR,
      event.offsetY * dPR,
      {
        pressure: event.pressure
      }
    );
  }

  drawPathStart(point) {
    if (!this._debugMode) {
      return;
    }

    this._canvasContext.beginPath();
    this._canvasContext.arc(
      point.x,
      point.y,
      5,
      0,
      2 * Math.PI,
      false
    );
    this._canvasContext.fillStyle = 'rgba(46,204,113,0.6)';
    this._canvasContext.fill();
  }

  drawBetweenPoints(fromPoint, toPoint) {
    this._canvasContext.beginPath();
    this._canvasContext.moveTo(fromPoint.x, fromPoint.y);
    this._canvasContext.lineTo(toPoint.x, toPoint.y);
    this._canvasContext.lineWidth = 1;
    this._canvasContext.strokeStyle = `rgba(0, 0, 0, ${toPoint.data.pressure})`;
    this._canvasContext.stroke();
  }

  drawPathEnd(point) {
    if (!this._debugMode) {
      return;
    }

    this._canvasContext.beginPath();
    this._canvasContext.arc(
      point.x,
      point.y,
      5,
      0,
      2 * Math.PI,
      false
    );
    this._canvasContext.fillStyle = 'rgba(231,76,60,0.6)';
    this._canvasContext.fill();
  }

  drawPathBoundingBox(path) {
    if (!this._debugMode) {
      return;
    }

    const boundingBox = path.getBoundingBox();

    this._canvasContext.strokeStyle = `rgba(0, 0, 0, 0.5)`;
    this._canvasContext.strokeRect(
      boundingBox.x,
      boundingBox.y,
      boundingBox.w,
      boundingBox.h);
    this._canvasContext.stroke();
  }
}


window.GauntFace = window.GauntFace || {};
window.GauntFace.CalendarApp = window.GauntFace.CalendarApp ||
  new CalendarAppController();
