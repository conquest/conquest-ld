"use strict";

let draw = document.querySelector("#draw"),
    cvs = document.querySelector("canvas");
cvs.width = draw.offsetWidth - (draw.offsetWidth % 10);

let canvas = new Canvas();

let tile = document.querySelector("#tile"),
    city = document.querySelector("#city"),
    region = document.querySelector("#region"),
    menu = document.querySelector("#region-menu"),
    list = document.querySelector("#region-list");

let cards = Array.from(document.querySelector("#modify").childNodes).filter(node => node.nodeType != 3);
cards.map(card => {
    card.onclick = () => {
        menu.style.display = "none";
        list.style.display = "none";

        cards.map(card => card.classList.remove("selected"));
        card.classList.add("selected");
    };
});

tile.addEventListener("click", () => canvas.enableRect());
tile.click();

city.addEventListener("click", () => canvas.enableCity());
region.addEventListener("click", () => {
    menu.style.display = "flex";
    list.style.display = "flex";

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

    let clearAndSelect = row => {
        Array.from(list.childNodes).map(node => node.classList.remove("selected"));
        row.classList.add("selected");
    };

    let regions = canvas.regions;
    for (let i = 0; i < regions.length; i++) {
        if (regions[i].name == name) {
            regions[i].color = wheel;
            canvas.currentRegion = regions[i];

            let preview = list.childNodes[i].getElementsByClassName("color-preview")[0];
            preview.style.backgroundColor = wheel;
            clearAndSelect(list.childNodes[i]);

            return;
        }
    }

    canvas.addRegion(name, wheel);

    let row = document.createElement("div");
    row.setAttribute("class", "row");

    let rName = document.createElement("p");
    rName.innerText = name;

    let div = document.createElement("div");
    div.setAttribute("class", "color-preview");
    div.style.backgroundColor = wheel;

    row.appendChild(rName);
    row.appendChild(div)
    list.appendChild(row);

    row.onclick = function () {
        let index = Array.from(list.childNodes).indexOf(this);
        canvas.currentRegion = regions[index];
        clearAndSelect(this);
    };

    clearAndSelect(row);
};
