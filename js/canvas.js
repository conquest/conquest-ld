"use strict";

class Canvas {
    constructor() {
        this._canvas = document.querySelector("canvas");
        this._ctx = this._canvas.getContext("2d");

        this._grid = new Image();
        this._grid.src = "./assets/grid.svg";
        this._grid.onload = () => {
            this.drawGrid();
        }

        this._origin = [0,0];

        document.onkeydown = e => {
            switch (e.keyCode) {
                case 65:
                case 37: {
                    this._ctx.translate(10, 0);
                    this._origin[0] -= 10;
                    this.refresh();
                    break;
                }
                case 87:
                case 38: {
                    this._ctx.translate(0, 10);
                    this._origin[1] -= 10;
                    this.refresh();
                    break;
                }
                case 68:
                case 39: {
                    this._ctx.translate(-10, 0);
                    this._origin[0] += 10;
                    this.refresh();
                    break;
                }
                case 83:
                case 40: {
                    this._ctx.translate(0, -10);
                    this._origin[1] += 10;
                    this.refresh();
                    break;
                }
            }
        };

        this._ctx.lineWidth = 2;
        this._ctx.strokeStyle = "black";

        this._tiles = [];
        this._prevTile = null;

        this.clear();
    }

    get tiles() {
        return this._tiles;
    }

    mousePosition(e) {
        let rect = this._canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left + this._origin[0],
            y: e.clientY - rect.top + this._origin[1]
        };
    }

    gridSnap(coord, snap) {
        coord.x -= coord.x % snap;
        coord.y -= coord.y % snap;

        return coord;
    }

    mouseInTile(point) {
        for (let tile of this.tiles) {
            if (tile.bl.x < point.x && tile.tr.x > point.x &&
                tile.bl.y > point.y && tile.tr.y < point.y) return true;
        }

        return false;
    }

    enableRect() {
        let pressed = false;
        let cornerA = null,
            cornerB = null;

        this._canvas.onmousedown = e => {
            if (!pressed) {
                cornerA = this.mousePosition(e);
                if (this.mouseInTile(cornerA)) return;

                this._canvas.onmousemove = e2 => {
                    cornerB = this.mousePosition(e2);
                    this.refresh();
                    this.drawBox(this.gridSnap(cornerA, 10), this.gridSnap(cornerB, 10));
                };

                pressed = true;
            }
        };

        this._canvas.onmouseup = () => {
            if (pressed && cornerB) {
                this._canvas.onmousemove = null;
                if (Math.abs(cornerA.x - cornerB.x) >= 10 && Math.abs(cornerA.y - cornerB.y) >= 10) {
                    this.tiles.push(this._prevTile);
                }
                this.refresh();

                pressed = false;
            }
        };
    }

    refresh() {
        this.clear();
        for (let tile of this.tiles) {
            this.drawTile(tile);
        }
    }

    clear() {
        this._ctx.clearRect(this._origin[0], this._origin[1], this._canvas.width, this._canvas.height);

        this._ctx.fillStyle = "#DFDCE1";
        this._ctx.fillRect(this._origin[0], this._origin[1], this._canvas.width, this._canvas.height);
        this.drawGrid();
    }

    drawGrid() {
        this._ctx.drawImage(this._grid, this._origin[0], this._origin[1]);

        this._ctx.beginPath();
        let offsets = [this._canvas.offsetWidth, this._canvas.offsetHeight];
        this._ctx.moveTo(this._origin[0], (offsets[1] / 2) - (offsets[1] / 2 % 10));
        this._ctx.lineTo(this._origin[0] + offsets[0], (offsets[1] / 2) - (offsets[1] / 2 % 10));

        this._ctx.moveTo((offsets[0] / 2) - (offsets[0] / 2 % 10), this._origin[1]);
        this._ctx.lineTo((offsets[0] / 2) - (offsets[0] / 2 % 10), this._origin[1] + offsets[1]);
        this._ctx.stroke();
    }

    drawBox(a, b) {
        this._ctx.fillStyle = "rgba(135, 195, 104, 0.75)";

        let w = b.x - a.x,
            h = b.y - a.y,
            offX = w < 0 ? w : 0,
            offY = h < 0 ? h : 0;

        for (let t of this.tiles) {
            if (a.x + offX < t.tr.x && a.x + offX + Math.abs(w) > t.bl.x &&
                a.y + offY < t.bl.y && a.y + offY + Math.abs(h) > t.tr.y) {
                this.drawTile(this._prevTile);
                return;
            }
        }

        this._ctx.beginPath();
        this._ctx.rect(a.x + offX, a.y + offY, Math.abs(w), Math.abs(h));
        this._prevTile = new Tile(a, b);
        this._ctx.fill();
        this._ctx.stroke();
    }

    drawTile(tile) {
        this._ctx.fillStyle = "rgba(154, 156, 165, 0.75)";

        this._ctx.beginPath();
        this._ctx.rect(tile.bl.x, tile.tr.y, tile.tr.x - tile.bl.x, tile.bl.y - tile.tr.y);
        this._ctx.fill();
        this._ctx.stroke();
    }
}
