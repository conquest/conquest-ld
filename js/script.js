"use strict";

let draw = document.querySelector("#draw"),
    cvs = document.querySelector("canvas");
cvs.width = draw.offsetWidth - (draw.offsetWidth % 10);

let canvas = new Canvas();

let tile = document.querySelector("#tile"),
    city = document.querySelector("#city"),
    region = document.querySelector("#region"),
    menu = document.querySelector("#region-menu");

let cards = Array.from(document.querySelector("#modify").childNodes).filter(node => node.nodeType != 3);
cards.map(card => {
    card.onclick = () => {
        menu.style.display = "none";
        cards.map(card => card.classList.remove("selected"));
        card.classList.add("selected");
    };
});

tile.addEventListener("click", () => canvas.enableRect());
tile.click();

city.addEventListener("click", () => canvas.enableCity());
region.addEventListener("click", () => {
    menu.style.display = "flex";

    canvas.enableRegion();
});

document.querySelector("#wheel").onchange = function () {
    document.querySelector("#colors").style.backgroundColor = this.value;
};

draw.onclick = () => canvas.state = true;

menu.onclick = e => {
    e.stopPropagation();
    if (canvas.state) {
        canvas.state = false;
    }
};

document.querySelector("form").onsubmit = e => {
    e.preventDefault();
    let name = document.querySelector("#name").value.trim(),
        wheel = document.querySelector("#wheel").value;

    let regions = canvas.regions;
    for (let region of regions) {
        if (region.name == name) {
            region.color = wheel;
            canvas.currentRegion = region;
            return;
        }
    }

    canvas.addRegion(name, wheel);
};
