'use strict';

(() => {
  const currentScript = document._currentScript || document.currentScript;
  const componentDoc = currentScript.ownerDocument;

  class GFDrawingCanvas extends window.GauntFace.BaseView {
    attachedCallback() {
      this._canvasArea = this.shadowRoot.querySelector('.js-canvas-area');
      this._canvasContext = this._canvasArea.getContext('2d');

      this.waitForDimensions()
      .then(() => {
        return this.prepareDrawingEvents();
      });
    }

    createdCallback() {
      super.createdCallback();

      const root = this.createShadowRoot();
      const template = componentDoc.querySelector('template');
      const clone = document.importNode(template.content, true);
      root.appendChild(clone);

      this._debugMode = true;

      this._paths = [];
      this._currentPath = null;

      this.waitForDimensions = this.waitForDimensions.bind(this);
      this.onResize = this.onResize.bind(this);

      return this.componentLoaded();
    }

    setPaths(paths) {
      if (paths.length === 0) {
        return;
      }

      paths.forEach(path => {
        this._paths.push(path);
      });

      this.refreshCanvas();
    }

    waitForDimensions() {
      return new Promise(resolve => {
        if (this.offsetWidth === 0 || this.offsetHeight === 0) {
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
      let dPR = window.devicePixelRatio || 1;

      // Switch off the canvas to get accurate parent measurement.
      this._canvasArea.style.display = 'none';

      // Find out how large the parent element is.
      let width = this.offsetWidth;
      let height = this.offsetHeight;

      if (width === 0 || height === 0) {
        requestAnimationFrame(this.waitForDimensions);
        return;
      }

      // Switch it back on.
      this._canvasArea.style.display = 'block';

      // Scale the backing store by the dPR.
      this._canvasArea.width = width * dPR;
      this._canvasArea.height = height * dPR;
    }

    refreshCanvas() {
      // Draw Previous Drawings
      this._paths.forEach(pathPoints => {
        this.drawPathStart(pathPoints[0]);
        for (var i = 1; i < pathPoints.length - 1; i++) {
          this.drawBetweenPoints(pathPoints[i - 1], pathPoints[i]);
        }
        this.drawPathEnd(pathPoints[pathPoints.length - 1]);
      });
    }

    addPath(newDrawnPath) {
      this._paths.push(newDrawnPath);

      const event = new CustomEvent('paths-change', {detail: this._paths});
      this.dispatchEvent(event);
    }

    prepareDrawingEvents() {
      if (!window.PointerEvent) {
        // Pointer events are supported.
        throw new Error('Pointer events are required.');
      }

      let pointerStartHandler = event => {
        console.log('Pointer Start', event.button, event.buttons);
        // Allow mouse throw during debug mode.
        if (!(this._debugMode && event.pointerType === 'mouse' &&
          event.pressure > 0)) {
          if (event.pointerType !== 'pen' || event.pressure === 0) {
            return;
          }
        }

        // If eraser button is pressed, return
        if (event.button === 5) {
          return;
        }

        event.preventDefault();

        let point = this.getPointFromEvent(event);
        this._currentPath = new window.GauntFace.DrawnPath();
        this._currentPath.addToPath(point);

        this.drawPathStart(point);
      };

      let pointerEndHandler = event => {
        console.log('Pointer End', event.button, event.buttons);
        if (!(this._debugMode && event.pointerType === 'mouse')) {
          if (event.pointerType !== 'pen') {
            return;
          }
        }

        // If eraser button is pressed, return
        if (event.button === 5) {
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
        console.log('Pointer Move', event.button, event.buttons);
        if (!(this._debugMode && event.pointerType === 'mouse' &&
          event.pressure > 0)) {
          if (event.pointerType !== 'pen' || event.pressure === 0) {
            return;
          }
        }

        // If eraser button is pressed, return
        if (event.button === 5) {
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

      this.addEventListener('pointerdown', pointerStartHandler);

      this.addEventListener('pointermove', pointerMoveHandler);

      this.addEventListener('pointerup', pointerEndHandler);

      this.addEventListener('pointerenter', pointerStartHandler);

      this.addEventListener('pointerleave', pointerEndHandler);
    }

    getPointFromEvent(event) {
      // let dPR = window.devicePixelRatio || 1;

      return new window.GauntFace.Point(
        event.offsetX,
        event.offsetY,
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
      // console.log('From: ', fromPoint);
      // console.log('To: ', toPoint);
      this._canvasContext.beginPath();
      this._canvasContext.moveTo(fromPoint.x, fromPoint.y);
      this._canvasContext.lineTo(toPoint.x, toPoint.y);
      this._canvasContext.lineWidth = 1;
      this._canvasContext.strokeStyle = `rgba(0, 0, 0, ` +
        `${toPoint.data.pressure})`;
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

  document.registerElement('gf-drawing-canvas', {
    prototype: GFDrawingCanvas.prototype
  });
})();
