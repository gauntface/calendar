'use strict';

(() => {
  const currentScript = document._currentScript || document.currentScript;
  const componentDoc = currentScript.ownerDocument;

  class GFDrawingCanvas extends window.GauntFace.BaseView {
    constructor() {
      super();

      this._debugMode = true;

      this._paths = [];
      this._currentPath = null;

      this.waitForDimensions.bind(this);
      this.onResize.bind(this);
    }

    attachedCallback() {

    }

    createdCallback() {
      super.createdCallback();

      const root = this.createShadowRoot();
      const template = componentDoc.querySelector('template');
      const clone = document.importNode(template.content, true);
      root.appendChild(clone);

      this.componentLoaded();
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
