"use strict";

const draw = document.getElementById("draw"),
    cvs = document.querySelector("canvas");
cvs.width = draw.offsetWidth - (draw.offsetWidth % 10);

const canvas = new Canvas();

const tile = document.getElementById("tile"),
    city = document.getElementById("city"),
    region = document.getElementById("region"),
    image = document.getElementById("image"),
    imageMenu = document.getElementById("image-menu"),
    regionMenu = document.getElementById("region-menu"),
    list = document.getElementById("region-list"),
    uploadMenu = document.getElementById("upload-menu");

const cards = Array.from(document.getElementById("modify").childNodes).filter(node => node.nodeType != 3);
cards.map(card => {
    card.onclick = () => {
        imageMenu.style.display = "none";
        regionMenu.style.display = "none";
        list.style.display = "none";
        uploadMenu.style.display = "none";

        cards.map(card => card.classList.remove("selected"));
        card.classList.add("selected");
    };
});

tile.addEventListener("click", () => canvas.enableRect());
tile.click();

city.addEventListener("click", () => canvas.enableCity());
region.addEventListener("click", () => {
    regionMenu.style.display = "flex";
    list.style.display = "flex";

    canvas.enableRegion();
});

image.addEventListener("click", () => {
    let img = canvas.image;
    if (!img.img.src) return;

    imageMenu.style.display = "flex";
    let width = document.getElementById("width"),
        height = document.getElementById("height"),
        scale = document.getElementById("scale");

    width.value = img.scale.width;
    height.value = img.scale.height;
    scale.value = img.scale.factor;

    canvas.enableImage();
});

document.getElementById("wheel").onchange = function () {
    document.getElementById("colors").style.backgroundColor = this.value;
};

draw.onclick = () => canvas.state = true;

const canvasOff = e => {
    e.stopPropagation();
    if (canvas.state) {
        canvas.state = false;
    }
};
regionMenu.onclick = canvasOff;
imageMenu.onclick = canvasOff;

document.getElementById("image-form").onsubmit = e => {
    e.preventDefault();
    let width = parseInt(document.getElementById("width").value),
        height = parseInt(document.getElementById("height").value),
        scale = parseFloat(document.getElementById("scale").value);

    canvas.scale = {width, height, scale};
};

document.getElementById("reset").onclick = () => {
    let img = canvas.image;

    document.getElementById("width").value = canvas.image.img.width;
    document.getElementById("height").value = canvas.image.img.height;
    document.getElementById("scale").value = 1;

    canvas.scale = {
        width: canvas.image.img.width,
        height: canvas.image.img.height,
        scale: 1
    };
    img.reset();
}

document.getElementById("region-form").onsubmit = e => {
    e.preventDefault();
    let name = document.getElementById("name").value.trim(),
        wheel = document.getElementById("wheel").value;

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

document.getElementById("upload").onclick = () => {
    imageMenu.style.display = "none";
    regionMenu.style.display = "none";
    list.style.display = "none";
    uploadMenu.style.display = "flex";

    let picture = document.getElementById("picture"),
        level = document.getElementById("level"),
        input = document.getElementById("up_file");

    if (!picture.onclick) {
        picture.onclick = () => {
            input.onchange = e => {
                let file = e.target.files[0];
                if (!file) return;

                let reader = new FileReader();
                reader.readAsDataURL(file);

                reader.onload = () => {
                    canvas.image = reader.result;
                    uploadMenu.style.display = "none";
                };
            };

            input.click();
        };

        level.onclick = () => {
            input.click();
        };
    }
};
