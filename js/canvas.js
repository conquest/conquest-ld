"use strict";

class Canvas {
    constructor() {
        this._canvas = document.querySelector("canvas");
        this._ctx = this._canvas.getContext("2d");

        this._ctx.lineWidth = 2;
        this._tiles = [];

        this.clear();
    }

    get tiles() {
        return this._tiles;
    }

    mousePosition(e) {
        let rect = this._canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    mouseInTile(point) {
        for (let tile of this.tiles) {
            if (tile.bl.x < point.x && tile.tr.x > point.x &&
                tile.bl.y > point.y && tile.tr.y < point.y) return true;
        }

        return false;
    }

    enableRect() {
        this._canvas.onmousedown = e => {
            let cornerA = this.mousePosition(e);
            if (this.mouseInTile(cornerA)) return;

            let cornerB = null;

            this._canvas.onmousemove = e2 => {
                cornerB = this.mousePosition(e2);
                this.refresh();
                this.drawBox(cornerA, cornerB);
            };

            this._canvas.onmouseup = () => {
                if (!cornerB) return;

                this._canvas.onmousemove = null;
                this.tiles.push(new Tile(cornerA, cornerB));
            };
        };
    }

    refresh() {
        this.clear();
        for (let tile of this.tiles) {
            this.drawBox(tile.bl, tile.tr);
        }
    }

    clear() {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        this._ctx.fillStyle = "#DFDCE1";
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }

    drawBox(a, b) {
        this._ctx.fillStyle = "rgba(49, 49, 49, 0.75)";
        this._ctx.strokeStyle = 'black';

        let w = b.x - a.x,
            h = b.y - a.y,
            offX = w < 0 ? w : 0,
            offY = h < 0 ? h : 0;

        if (Math.abs(w) < 5 || Math.abs(h) < 5) return;

        this._ctx.beginPath();

        this._ctx.rect(a.x + offX, a.y + offY, Math.abs(w), Math.abs(h));
        this._ctx.fill();

        this._ctx.stroke();
    }
}
