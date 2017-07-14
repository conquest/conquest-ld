"use strict";

class City {
    constructor(point) {
        this._point = point;

        this._major = false;
    }

    static get radius() {
        return 10;
    }

    set point(point) {
        this._point = point;
    }

    get point() {
        return this._point;
    }

    set major(major) {
        this._major = major;
    }

    get major() {
        return this._major;
    }

    get fillStyle() {
        return this._major ? "goldenrod" : "lightgray";
    }

    translate(x, y) {
        this.point.x += x;
        this.point.y += y;
    }

    export(point) {
        return {
            x: this.point.x - point.x,
            y: this.point.y - point.y,
            major: this.major
        };
    }
}
