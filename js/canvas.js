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

        let fonts = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', sans-serif";
        this._ctx.font = "20px " + fonts;

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

    tileUnderMouse(point) {
        for (let t of this.tiles) {
            if (t.point.x < point.x && t.point.x + t.width > point.x &&
                t.point.y + t.height > point.y && t.point.y < point.y) return t;
        }

        return null;
    }

    cardinalUnderMouse(tile, point) {
        let dirs = tile.cardinal;
        for (let dir in dirs) {
            if (point.x > dirs[dir].x - 5 && point.x < dirs[dir].x + 5 &&
                point.y > dirs[dir].y - 5 && point.y < dirs[dir].y + 5) {
                return dir;
            }
        }

        return null;
    }

    drawCardinal(tile) {
        this._ctx.fillStyle = "lightblue";
        this._ctx.strokeStyle = "rgb(0, 150, 255)";

        for (let dot of Object.values(tile.cardinal)) {
            this._ctx.beginPath();
            this._ctx.rect(dot.x - 5, dot.y - 5, 10, 10);
            this._ctx.fill();
            this._ctx.stroke();
        }
    }

    mouseDelta(prev, curr) {
        return {
            x: curr.x - prev.x,
            y: curr.y - prev.y
        };
    }

    handleSelection(tile, start) {
        let prev = start;
        let holdEvent = this._canvas.onmouseup;

        tile.strokeStyle = "rgb(0, 150, 255)";
        tile.resize = true;
        this.refresh();

        let cardinal = this.cardinalUnderMouse(tile, start);

        this._canvas.onmousemove = e => {
            let curr = this.mousePosition(e);

            let delta = this.mouseDelta(this.gridSnap(prev, 10), this.gridSnap(this.mousePosition(e), 10));
            if (delta.x != 0 || delta.y != 0) {

                let old = Object.assign({}, tile.point);
                old.width = tile.width;
                old.height = tile.height;

                if (cardinal) {
                    let dirs = tile.cardinal;
                    switch(dirs[cardinal]) {
                        case dirs.N: {
                            tile.translate(0, delta.y);
                            tile.reshape(0, -delta.y);
                            break;
                        }
                        case dirs.E: {
                            tile.reshape(delta.x, 0);
                            break;
                        }
                        case dirs.S: {
                            tile.reshape(0, delta.y);
                            break;
                        }
                        case dirs.W: {
                            tile.translate(delta.x, 0);
                            tile.reshape(-delta.x, 0);
                            break;
                        }
                    }
                } else {
                    tile.translate(delta.x, delta.y);
                }

                if (this.findCollision(tile) || tile.width <= 0 || tile.height <= 0) {
                    tile.point = {x: old.x, y: old.y};

                    tile.width = old.width;
                    tile.height = old.height;
                } else {
                    prev = curr;
                }
            }

            this.refresh();
            this.drawCardinal(tile);
        };

        this._canvas.onmouseup = () => {
            this._canvas.onmousemove = null;
            this._canvas.onmouseup = holdEvent;

            tile.strokeStyle = "black";
            tile.resize = false;
        };
    }

    enableRect() {
        let pressed = false;
        let cornerA = null,
            cornerB = null;

        this._canvas.onmousedown = e => {
            if (!pressed) {
                cornerA = this.mousePosition(e);

                for (let t of this.tiles) {
                    if (this.cardinalUnderMouse(t, cornerA)) {
                        this.handleSelection(t, cornerA);
                        t.resize = false;
                        return;
                    }
                }

                let selected = this.tileUnderMouse(cornerA);
                if (selected) {
                    this.handleSelection(selected, cornerA);
                    return;
                }

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
                cornerA = null;
                cornerB = null;
            }
        };
    }

    refresh() {
        this.clear();
        for (let t of this.tiles) {
            this.drawTile(t);
            if (t.resize) {
                this.drawCardinal(t);
            }
        }
    }

    clear() {
        this._ctx.clearRect(this._origin[0], this._origin[1], this._canvas.width, this._canvas.height);

        this._ctx.fillStyle = "#DFDCE1";
        this._ctx.fillRect(this._origin[0], this._origin[1], this._canvas.width, this._canvas.height);
        this.drawGrid();
    }

    drawGrid() {
        let message = "(" + this._origin[0] / 10 + ", " +  -this._origin[1] / 10 + ")",
            coord = [this._canvas.width + this._origin[0] - message.length * 10, this._origin[1] + 25];

        this._ctx.fillStyle = "#EF5A48";
        this._ctx.fillText(message, coord[0], coord[1]);

        this._ctx.strokeStyle = "black";
        this._ctx.fillStyle = "black";
        this._ctx.drawImage(this._grid, this._origin[0], this._origin[1]);

        this._ctx.beginPath();
        let offsets = [this._canvas.offsetWidth, this._canvas.offsetHeight];
        this._ctx.moveTo(this._origin[0], (offsets[1] / 2) - (offsets[1] / 2 % 10));
        this._ctx.lineTo(this._origin[0] + offsets[0], (offsets[1] / 2) - (offsets[1] / 2 % 10));

        this._ctx.moveTo((offsets[0] / 2) - (offsets[0] / 2 % 10), this._origin[1]);
        this._ctx.lineTo((offsets[0] / 2) - (offsets[0] / 2 % 10), this._origin[1] + offsets[1]);
        this._ctx.stroke();
    }

    findCollision(rect) {
        for (let t of this.tiles) {
            if (rect == t) continue;
            if (rect.point.x < t.point.x + t.width && rect.point.x + rect.width > t.point.x &&
                rect.point.y < t.point.y + t.height && rect.point.y + rect.height > t.point.y) {
                return true;
            }
        }

        return false;
    }

    drawBox(a, b) {
        this._ctx.strokeStyle = "black";
        this._ctx.fillStyle = "rgba(135, 195, 104, 0.75)";

        let w = b.x - a.x,
            h = b.y - a.y,
            offX = w < 0 ? w : 0,
            offY = h < 0 ? h : 0;

        let preview = new Tile(a, b);
        if (this.findCollision(preview)) {
            this.drawTile(this._prevTile);
            return;
        }

        this._ctx.beginPath();
        this._ctx.rect(a.x + offX, a.y + offY, Math.abs(w), Math.abs(h));
        this._prevTile = preview;
        this._ctx.fill();
        this._ctx.stroke();
    }

    drawTile(tile) {
        this._ctx.fillStyle = tile.fillStyle;
        this._ctx.strokeStyle = tile.strokeStyle;

        this._ctx.beginPath();
        this._ctx.rect(tile.point.x, tile.point.y, tile.width, tile.height);
        this._ctx.fill();
        this._ctx.stroke();
    }
}
