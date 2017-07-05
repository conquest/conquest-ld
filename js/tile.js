"use strict";

class Tile {
    constructor(pointA, pointB) {
        this._point = {
            x: Math.min(pointA.x, pointB.x),
            y: Math.min(pointA.y, pointB.y)
        };

        this._width = Math.abs(pointB.x - pointA.x);
        this._height = Math.abs(pointB.y - pointA.y);
    }

    get point() {
        return this._point;
    }

    set point(point) {
        this._point = point;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    translate(x, y) {
        this.point.x += x;
        this.point.y += y;
    }
}
