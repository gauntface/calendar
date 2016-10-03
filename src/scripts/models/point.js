'use strict';

class Point {
  constructor(x, y, data) {
    this._xcoord = x;
    this._ycoord = y;
    this._data = data || {};
  }

  get x() {
    return this._xcoord;
  }

  get y() {
    return this._ycoord;
  }

  get data() {
    return this._data;
  }

  getAsObject() {
    return {
      x: this._xcoord,
      y: this._ycoord,
      data: this._data
    };
  }
}

window.GauntFace = window.GauntFace || {};
window.GauntFace.Point = window.GauntFace.Point || Point;
