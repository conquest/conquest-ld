"use strict";

class Tile {
    constructor(pointA, pointB) {
        this._bl = {
            x: Math.min(pointA.x, pointB.x),
            y: Math.max(pointA.y, pointB.y)
        };
        this._tr = {
            x: Math.max(pointA.x, pointB.x),
            y: Math.min(pointA.y, pointB.y)
        };
    }

    get bl() {
        return this._bl;
    }

    get tr() {
        return this._tr;
    }
}
