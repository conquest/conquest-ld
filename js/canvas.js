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

        this._origin = [0, 0];
        this._ctx.lineWidth = 2;

        let fonts = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', sans-serif";
        this._ctx.font = "20px " + fonts;

        this._tiles = [];
        this._prevTile = null;

        this._regions = [];
        this._currentRegion = null;

        this._image = {
            img: new Image(),
            position: [this._canvas.offsetWidth / 2, this._canvas.offsetHeight / 2].map(val => val - (val % 10)),
            mode: false,
            scale: {},
            reset: () => {
                this._image.position = [this._canvas.offsetWidth / 2, this._canvas.offsetHeight / 2].map(val => val - (val % 10));
                this._image.position[1] -= this._image.img.height;
                this.refresh();
            }
        };

        this._keydown = null;
        this._state = true;
        this.clear();
    }

    get tiles() {
        return this._tiles;
    }

    get state() {
        return this._state;
    }

    set state(state) {
        this._state = state;
    }

    get regions() {
        return this._regions;
    }

    set currentRegion(region) {
        this._currentRegion = region;
    }

    set image(src) {
        this._image.img.src = src;
        this._image.position = [this._canvas.offsetWidth / 2, this._canvas.offsetHeight / 2].map(val => val - (val % 10));

        this._image.img.onload = () => {
            this._image.position[1] -= this._image.img.height;
            this._image.scale.width = this._image.img.width;
            this._image.scale.height = this._image.img.height;
            this._image.scale.factor = 1;

            this.refresh();
        };
    }

    get image() {
        return this._image;
    }

    set scale(scale) {
        this._image.scale.width = scale.width;
        this._image.position[1] -= this._image.scale.height * (1 + scale.scale - this._image.scale.factor) - this._image.scale.height;
        this._image.position[1] -= (scale.height - this._image.scale.height) * scale.scale;
        this._image.scale.height = scale.height;
        this._image.scale.factor = scale.scale;

        this.refresh();
    }

    enable() {
        this.disable();

        document.onkeydown = e => {
            if (!this.state) return;
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
    }

    disable() {
        this._canvas.onclick = null;
        this._canvas.onmousedown = null;
        this._canvas.onmouseup = null;
        document.onkeydown = null;

        document.removeEventListener("keydown", this._keydown);
        this._keydown = null;

        this._image.mode = false;

        this.tiles.map(tile => tile.selected = false);
        this.refresh();
    }

    mousePosition(e) {
        let rect = this._canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left + this._origin[0],
            y: e.clientY - rect.top + this._origin[1]
        };
    }

    gridSnap(coord, snap=10) {
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

        tile.selected = true;
        this.refresh();

        let cardinal = this.cardinalUnderMouse(tile, start);

        this._canvas.onmousemove = e => {
            let curr = this.mousePosition(e);

            let delta = this.mouseDelta(this.gridSnap(prev), this.gridSnap(this.mousePosition(e)));
            if (delta.x != 0 || delta.y != 0) {
                let old = Object.assign({}, tile.point);
                old.width = tile.width;
                old.height = tile.height;

                let city = tile.city;
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

                    if (city && (city.point.x > tile.point.x + tile.width || city.point.x < tile.point.x ||
                        city.point.y < tile.point.y || city.point.y > tile.point.y + tile.height)) {
                        tile.city = null;
                    }
                } else {
                    tile.translate(delta.x, delta.y);
                    if (city) {
                        city.translate(delta.x, delta.y);
                    }
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
        };

        this._canvas.onmouseup = () => {
            this._canvas.onmousemove = null;
            this._canvas.onmouseup = holdEvent;
        };
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
        this._ctx.fillStyle = "rgba(135, 195, 104, 0.65)";

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
        this._ctx.strokeStyle = tile.selected ? "rgb(0, 150, 255)" : "black";

        this._ctx.beginPath();
        this._ctx.rect(tile.point.x, tile.point.y, tile.width, tile.height);
        this._ctx.fill();
        this._ctx.stroke();
    }

    enableRect() {
        this.enable();

        let pressed = false,
            cornerA = null,
            cornerB = null;

        this._keydown = e => {
            if (e.keyCode == 27) {
                this._canvas.onmousemove = null;
                this.refresh();

                pressed = false;
                cornerA = null;
                cornerB = null;
            } else if (e.keyCode == 8) {
                for (let i = this.tiles.length - 1; i >= 0; i--) {
                    if (this.tiles[i].selected) this.tiles.splice(i, 1);
                }
                this.refresh();
            }
        };
        document.addEventListener("keydown", this._keydown);

        this._canvas.onmousedown = e => {
            if (!pressed) {
                cornerA = this.mousePosition(e);

                for (let t of this.tiles) {
                    if (t.selected && this.cardinalUnderMouse(t, cornerA)) {
                        this.handleSelection(t, cornerA);
                        this.refresh();
                        return;
                    }
                }

                let selected = this.tileUnderMouse(cornerA);
                if (selected) {
                    this.tiles.map(t => t.selected = false);
                    this.handleSelection(selected, cornerA);
                    return;
                }

                this._canvas.onmousemove = e2 => {
                    cornerB = this.mousePosition(e2);
                    this.refresh();
                    this.drawBox(this.gridSnap(cornerA), this.gridSnap(cornerB));
                };

                pressed = true;
            }
            this.tiles.map(t => t.selected = false);
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

    drawCity(tile) {
        let city = tile.city;
        this._ctx.fillStyle = city.fillStyle;

        this._ctx.beginPath();
        this._ctx.arc(city.point.x, city.point.y, City.radius, 0, 2 * Math.PI);
        this._ctx.fill();
        this._ctx.stroke();
    }

    enableCity() {
        this.enable();
        let city = null;

        let cityUnderMouse = (tile, point) => {
            let c = tile.city,
                rad = City.radius / 2;

            if (c && point.x > c.point.x - rad && point.x < c.point.x + rad &&
                point.y > c.point.y - rad && point.y < c.point.y + rad) {
                return c;
            }

            return null;
        };

        this._keydown = e => {
            if (e.keyCode == 8) {
                this.tiles.map(tile => {
                    if (tile.city == city) {
                        tile.city = null;
                    }
                });
                this.refresh();
            }
        };
        document.addEventListener("keydown", this._keydown);

        this._canvas.onclick = e => {
            let click = this.mousePosition(e),
                tile = this.tileUnderMouse(click);

            if (tile) {
                city = cityUnderMouse(tile, click);
                let snap = this.gridSnap(click, 5);

                if (city) {
                    city.major = !city.major;
                }

                if (tile.city) {
                    tile.city.point = snap;
                } else {
                    tile.city = new City(snap);
                }

                this.refresh();
            }
        };
    }

    addRegion(name, color) {
        let region = new Region(name, color);
        this._regions.push(region);
        this._currentRegion = region;
    }

    enableRegion() {
        this.enable();

        this._canvas.onclick = e => {
            if (this._currentRegion) {
                let click = this.mousePosition(e),
                    tile = this.tileUnderMouse(click);

                if (tile) {
                    let old = tile.fillStyle;
                    tile.fillStyle = this._currentRegion.color;

                    if (!this._currentRegion.contains(tile)) {
                        for (let region of this.regions) {
                            region.remove(tile);
                        }

                        this._currentRegion.add(tile);
                    } else {
                        if (old == tile.fillStyle) {
                            this._currentRegion.remove(tile);
                            this._tiles.push(tile);
                            tile.fillStyle = "rgba(154, 156, 165, 0.65)";
                        } else {
                            tile.fillStyle = this._currentRegion.color;
                        }
                    }
                }
            }

            this.refresh();
        };
    }

    enableImage() {
        this.enable();

        this._image.mode = true;
        this.refresh();

        this._canvas.onmousedown = e => {
            let prev = this.mousePosition(e);

            this._canvas.onmousemove = e => {
                let curr = this.mousePosition(e);

                let delta = this.mouseDelta(this.gridSnap(prev), this.gridSnap(this.mousePosition(e)));
                if (delta.x != 0 || delta.y != 0) {
                    this._image.position[0] += delta.x;
                    this._image.position[1] += delta.y;

                    this.refresh();
                    prev = curr;
                }
            }
        };

        this._canvas.onmouseup = () => {
            this._canvas.onmousemove = null;
        };
    }

    refresh() {
        this.clear();

        let defer = [];
        let draw = t => {
            this.drawTile(t);
            if (t.city) {
                this.drawCity(t);
            }
        };

        for (let t of this.tiles) {
            if (t.selected) {
                defer.push(t);
            } else {
                draw(t);
            }
        }

        defer.map(t => {
            draw(t);
            this.drawCardinal(t);
        });

        if (this._image.mode) {
            let width = this._image.scale.width * this._image.scale.factor,
                height = this._image.scale.height * this._image.scale.factor
            this._ctx.drawImage(this._image.img, this._image.position[0], this._image.position[1], width, height);
        }
    }

    clear() {
        this._ctx.clearRect(this._origin[0], this._origin[1], this._canvas.width, this._canvas.height);

        this._ctx.fillStyle = "#DFDCE1";
        this._ctx.fillRect(this._origin[0], this._origin[1], this._canvas.width, this._canvas.height);
        this.drawGrid();
    }

    drawGrid() {
        let center = "(" + this._origin[0] / 10 + ", " +  -this._origin[1] / 10 + ")",
            total = "Total Tiles: " + this.tiles.length

        if (!this._image.mode && this._image.img.src) {
            let width = this._image.scale.width * this._image.scale.factor,
                height = this._image.scale.height * this._image.scale.factor
            this._ctx.drawImage(this._image.img, this._image.position[0], this._image.position[1], width, height);
        }

        this._ctx.fillStyle = "#EF5A48";
        this._ctx.fillText(center, this._canvas.width + this._origin[0] - center.length * 10, this._origin[1] + 25);
        this._ctx.fillText(total, this._canvas.width + this._origin[0] - total.length * 9, this._canvas.height + this._origin[1] - 10)

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
}
