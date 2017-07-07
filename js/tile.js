"use strict";

class Tile {
    constructor(pointA, pointB) {
        this._point = {
            x: Math.min(pointA.x, pointB.x),
            y: Math.min(pointA.y, pointB.y)
        };

        this._width = Math.abs(pointB.x - pointA.x);
        this._height = Math.abs(pointB.y - pointA.y);

        this._fillStyle = "rgba(154, 156, 165, 0.75)";
        this._strokeStyle = "black";

        this._selected = false;

        this._city = null;
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

    set width(width) {
        this._width = width;
    }

    get height() {
        return this._height;
    }

    set height(height) {
        this._height = height;
    }

    get strokeStyle() {
        return this._strokeStyle;
    }

    set strokeStyle(strokeStyle) {
        this._strokeStyle = strokeStyle;
    }

    get fillStyle() {
        return this._fillStyle;
    }

    set fillStyle(fillStyle) {
        this._fillStyle = fillStyle;
    }

    get selected() {
        return this._selected;
    }

    set selected(selected) {
        this._selected = selected;
    }

    get city() {
        return this._city;
    }

    set city(city) {
        this._city = city;
    }

    translate(x, y) {
        this.point.x += x;
        this.point.y += y;
    }

    reshape(x, y) {
        this._width += x;
        this._height += y;
    }

    get cardinal() {
        return {
            N: {x: this.point.x + this.width / 2, y: this.point.y},
            E: {x: this.point.x + this.width, y: this.point.y + this.height / 2},
            S: {x: this.point.x + this.width / 2, y: this.point.y + this.height},
            W: {x: this.point.x, y: this.point.y + this.height / 2}
        };
    }
}
