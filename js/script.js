"use strict";

let draw = document.querySelector("#draw"),
    cvs = document.querySelector("canvas");
cvs.width = draw.offsetWidth;

let canvas = new Canvas();

canvas.enableRect();
