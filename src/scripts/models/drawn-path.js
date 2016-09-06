'use strict';

class DrawnPath {
  constructor() {
    this._pointsOnPath = [];
  }

  addToPath(newPoint) {
    this._pointsOnPath.push(newPoint);
  }

  getLastPoint() {
    return this._pointsOnPath[this._pointsOnPath.length - 1];
  }

  getBoundingBox() {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
  }
}

window.GauntFace = window.GauntFace || {};
window.GauntFace.DrawnPath = window.GauntFace.DrawnPath || DrawnPath;
