# conquest-ld

The level designer for the game `conquest`.

![preview](http://i.imgur.com/RDbnYPr.png)

## Usage

* Tiles
  * Click and drag to create a new tile.
  * Click and drag a tile to translate it.
  * Click a tile to select it and:
    * Click any of the four selection boxes to resize accordingly.
    * Press the `delete` key to remove the tile.
* Cities
  * Tiles can only have one city.
  * Click anywhere on a tile to place a city.
  * Click on a city to switch it from being either a minor or major city.
  * Click on a city and press the `delete` key to remove the city.
* Regions
  * Create a new region via the menu on the bottom.
    * Regions must have unique names.
    * To change the color of a region, type out the region's name and select a new color. Then, press `set`.
    * All regions can be selected from the region menu on the top right.
    * To remove the selected region (highlighted in the menu), press the `delete button`.
  * Click on a tile to add it to the selected region.
    * If the tile is already inside the selected region, it will be removed from that region.
    * If the tile is already inside a different region, it will be removed and added to the current region.
* Images
  * If there is no current image, the menu will do nothing.
  * To upload an image:
    * Press the `upload` button on the bottom, and press `image` inside the menu that has shown up.
  * If there is an image and the `Image` menu is selected, the image will be drawn on top of all tiles, otherwise under all tiles.
  * To modify an image:
    * The first input modifies the image `width`.
    * The second input modifies the image `height`.
    * The third input modifies the image `scale`.
    * Update using the `set` button.
    * Images can be reverted to their prior state by pressing `reset`.
  * Images can be moved by clicking anywhere on the canvas and dragging.
* Exporting and Importing
  * Levels can be exported by clicking `download`.
    * The first input field exports the level with a set scale. This is only used in `conquest` for larger or smaller map sizes.
    * The second input field is the map name.
    * Export a level by pressing `export` and the level will be downloaded as a `.json`.
  * Levels can be imported by clicking `upload` and selecting `level`.
    * Upload a `.json` and the map will be drawn and any editing up to the user.
