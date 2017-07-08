"use strict";

let draw = document.querySelector("#draw"),
    cvs = document.querySelector("canvas");
cvs.width = draw.offsetWidth - (draw.offsetWidth % 10);

let canvas = new Canvas();

let cards = Array.from(document.querySelectorAll(".card"));

cards.map(card => {
    card.onclick = () => {
        cards.map(card => card.classList.remove("selected"));
        card.classList.add("selected");
    };
});

document.querySelector("#tile").addEventListener("click", function () {
    canvas.enableRect();
});
document.querySelector("#tile").click();

document.querySelector("#city").addEventListener("click", function () {
    canvas.enableCity();
});
