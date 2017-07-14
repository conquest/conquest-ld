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
    uploadMenu = document.getElementById("upload-menu"),
    downloadMenu = document.getElementById("download-menu");

const cards = Array.from(document.getElementById("modify").childNodes).filter(node => node.nodeType != 3);
cards.map(card => {
    card.onclick = () => {
        imageMenu.style.display = "none";
        regionMenu.style.display = "none";
        list.style.display = "none";
        uploadMenu.style.display = "none";
        downloadMenu.style.display = "none";

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
downloadMenu.onclick = canvasOff;

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
};

const clearAndSelect = row => {
    Array.from(list.childNodes).map(node => node.classList.remove("selected"));
    row.classList.add("selected");
};

function regionRow(name, color) {
    let clearAndSelect = row => {
        Array.from(list.childNodes).map(node => node.classList.remove("selected"));
        row.classList.add("selected");
    };

    let row = document.createElement("div");
    row.setAttribute("class", "row");

    let rName = document.createElement("p");
    rName.innerText = name;

    let div = document.createElement("div");
    div.setAttribute("class", "color-preview");
    div.style.backgroundColor = color;

    row.appendChild(rName);
    row.appendChild(div)
    list.appendChild(row);

    row.onclick = function () {
        let index = Array.from(list.childNodes).indexOf(this);
        canvas.currentRegion = canvas.regions[index];
        clearAndSelect(this);
    };

    return row;
}

document.getElementById("region-form").onsubmit = e => {
    e.preventDefault();
    let name = document.getElementById("name").value.trim(),
        color = document.getElementById("wheel").value;

    let regions = canvas.regions;
    for (let i = 0; i < regions.length; i++) {
        if (regions[i].name == name) {
            regions[i].color = color;
            canvas.currentRegion = regions[i];

            let preview = list.childNodes[i].getElementsByClassName("color-preview")[0];
            preview.style.backgroundColor = color;
            clearAndSelect(list.childNodes[i]);

            return;
        }
    }

    canvas.addRegion(new Region(name, color));
    let row = regionRow(name, color);

    clearAndSelect(row);
};

document.getElementById("upload").onclick = () => {
    imageMenu.style.display = "none";
    regionMenu.style.display = "none";
    list.style.display = "none";
    uploadMenu.style.display = "flex";
    downloadMenu.style.display = "none";

    let picture = document.getElementById("picture"),
        level = document.getElementById("level"),
        input = document.getElementById("up_file");

    picture.onclick = () => {
        input.onchange = e => {
            let file = e.target.files[0];
            if (!(file && file.type.match(/.(jpg|jpeg|png|gif)$/i))) return;

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
        input.onchange = e => {
            let file = e.target.files[0];
            if (!(file && file.type.match("json"))) return;

            let reader = new FileReader();
            reader.readAsBinaryString(file);

            reader.onload = () => {
                let config = JSON.parse(reader.result);
                canvas.reset();
                list.innerHTML = "";

                for (let name in config.regions) {
                    let region = new Region(name, config.regions[name].color),
                        tiles = config.regions[name].tiles;

                    for (let tile of tiles) {
                        let t = new Tile({x: tile.x, y: canvas.center[1] - tile.h}, {x: tile.x + tile.w, y: canvas.center[1]});
                        t.translate(canvas.center[0], -tile.y);
                        canvas.tiles = t;
                        if (tile.city) {
                            t.city = new City({x: tile.city.x + t.point.x, y: tile.city.y + t.point.y});
                            t.city.major = tile.city.major;
                        }
                        t.fillStyle = region.color;

                        region.add(t);
                    }

                    regionRow(region.name, region.color);
                    canvas.addRegion(region);
                }

                canvas.refresh();
            };

        };

        input.click();
    };
};

document.getElementById("download").onclick = () => {
    imageMenu.style.display = "none";
    regionMenu.style.display = "none";
    list.style.display = "none";
    uploadMenu.style.display = "none";
    downloadMenu.style.display = "flex";

    document.getElementById("export-scale").value = 1;
    let fileName = document.getElementById("filename");
    fileName.onchange = function () {
        if (this.value.indexOf(".json") < 0) this.value += ".json";
    };
};

document.getElementById("export-button").onclick = () => {
    if (canvas.regions.length == 0) return;
    let out = document.getElementById("export"),
        fileName = document.getElementById("filename"),
        scale = parseFloat(document.getElementById("export-scale").value);

    let data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(canvas.export(scale), null, 4));
    out.href = data;
    out.download = fileName.value.trim();
};

document.getElementById("delete").onclick = () => {
    let index = canvas.regions.indexOf(canvas.currentRegion);
    if (index > -1) {
        canvas.regions.splice(index, 1);
        list.removeChild(list.childNodes[index]);
    }
};

window.onbeforeunload = e => {
    if (canvas.tiles.length == 0) return;
    return true;
};
