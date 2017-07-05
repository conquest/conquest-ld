"use strict";

let draw = document.querySelector("#draw"),
    cvs = document.querySelector("canvas");
cvs.width = draw.offsetWidth - (draw.offsetWidth % 10);

let canvas = new Canvas();
canvas.enableRect();
