"use strict";

class Region {
    constructor(name, color) {
        this._name = name;
        this._color = color;

        this._tiles = [];
    }

    get name() {
        return this._name;
    }

    get color() {
        return this._color;
    }

    set color(color) {
        this._color = color;
    }

    get tiles() {
        return this._tiles;
    }

    add(tile) {
        this._tiles.push(tile);
    }

    remove(tile) {
        let index = this.tiles.indexOf(tile);
        if (index > -1) {
            this._tiles.splice(index, 1);
        }
    }

    contains(tile) {
        return this.tiles.includes(tile);
    }

    export(center) {
        let config = {};
        config[this.name] = {};
        config[this.name].color = this.color;
        config[this.name].tiles = [];

        for (let tile of this.tiles) {
            config[this.name].tiles.push(tile.export(center));
        }

        return config;
    }
}
