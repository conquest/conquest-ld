"use strict";

class Canvas {
    constructor() {
        this._canvas = document.querySelector("canvas");
        this._ctx = this._canvas.getContext("2d");

        this._ctx.lineWidth = 2;

        this.clear();
    }

    mousePosition(e) {
        let rect = this._canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    enableRect() {
        this._canvas.onmousedown = e => {
            let cornerA = this.mousePosition(e);

            this._canvas.onmousemove = e2 => {
                let cornerB = this.mousePosition(e2);
                this.drawBox(cornerA, cornerB);
            };

            this._canvas.onmouseup = () => this._canvas.onmousemove = null;
        };
    }

    clear() {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        this._ctx.fillStyle = "#DFDCE1";
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }

    drawBox(a, b) {
        this.clear();
        this._ctx.fillStyle = "rgba(49, 49, 49, 0.75)";
        this._ctx.strokeStyle = 'black';

        let w = b.x - a.x,
            h = b.y - a.y,
            offX = w < 0 ? w : 0,
            offY = h < 0 ? h : 0;

        this._ctx.beginPath();

        this._ctx.rect(a.x + offX, a.y + offY, Math.abs(w), Math.abs(h));
        this._ctx.fill();

        this._ctx.stroke();
    }
}
