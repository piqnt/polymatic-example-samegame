/*
 * Copyright (c) Ali Shakiba
 * Licensed under the MIT license
 */

import { Middleware } from "polymatic";

import { type MainContext } from "./Main";
import { Tile } from "./Model";

export class Gameplay extends Middleware<MainContext> {
  tiles: Tile[] = [];
  tilesMap: Record<string, Tile> = {};

  constructor() {
    super();
    this.on("activate", this.handleActivate);
    this.on("user-start", this.handleUserStart);
    this.on("user-click", this.handleUserClick);
  }

  handleActivate = () => {
    this.setContext((context) => {
      context.tiles = this.tiles;
    });
  };

  handleUserStart = (nColors = 4) => {
    while (this.tiles.length) {
      this.removeTile(this.tiles[0]);
    }
    this.tilesMap = {};
    this.tiles.length = 0;
    for (let i = 0; i < this.context.width; i++) {
      for (let j = 0; j < this.context.height; j++) {
        this.insertTile(i, j, new Tile((Math.random() * nColors + 1) | 0));
      }
    }
    // this.emit("game-update");
  };

  insertTile = (i: number, j: number, tile: Tile) => {
    this.setTile(i, j, tile);
    tile.i = i;
    tile.j = j;
    this.tiles.push(tile);
  };

  handleUserClick = (tile: Tile) => {
    if (this.matchBoard(tile)) {
      this.collapseDown();
      setTimeout(() => {
        this.collapseLeft();
      }, 200);
    }
    // this.emit("game-update");
  };

  matchBoard = (tile: Tile) => {
    const matched: Tile[] = [];
    this.matchTile(tile, matched);
    if (matched.length <= 1) {
      return false;
    }
    for (let i = 0; i < matched.length; i++) {
      this.removeTile(matched[i]);
    }
    return true;
  };

  collapseDown = () => {
    let moved = false;
    do {
      moved = false;
      for (let i = 0; i < this.tiles.length; i++) {
        const tile = this.tiles[i];
        if (
          tile.j + 1 < this.context.height &&
          this.moveTile(tile.i, tile.j + 1, tile)
        ) {
          moved = true;
        }
      }
    } while (moved);
    // this.emit("game-update");
  };

  collapseLeft = () => {
    let moved: boolean;
    do {
      moved = false;
      for (let i = 0; i < this.context.width - 1; i++) {
        let empty = true;
        for (let j = 0; j < this.context.height && empty; j++) {
          empty = !this.getTile(i, j);
        }
        if (!empty) {
          continue;
        }
        for (let j = 0; j < this.context.height; j++) {
          const tile = this.getTile(i + 1, j);
          if (tile) {
            this.moveTile(i, j, tile);
            moved = true;
          }
        }
      }
    } while (moved);
    // this.emit("game-update");
  };

  getTile = (i: number, j: number) => {
    return this.tilesMap[i + ":" + j];
  };

  setTile = (i: number, j: number, tile: Tile) => {
    if (this.tilesMap[i + ":" + j]) {
      console.log("Location unavailable: " + i + ":" + j);
      return;
    }
    this.tilesMap[i + ":" + j] = tile;
  };

  unsetTile = (i: number, j: number, tile: Tile) => {
    if (this.tilesMap[i + ":" + j] !== tile) {
      console.log("Invalid location: " + i + ":" + j);
      return;
    }
    delete this.tilesMap[i + ":" + j];
  };

  matchTile = (tile: Tile, list: Tile[], search?: any, color?: any) => {
    search = search || +new Date();
    if (search == tile.search) {
      return;
    }
    tile.search = search;
    color = color || tile.color;
    if (color != tile.color) {
      return;
    }
    list.push(tile);
    let next: Tile;
    if ((next = this.getTile(tile.i + 1, tile.j))) {
      this.matchTile(next, list, search, color);
    }
    if ((next = this.getTile(tile.i - 1, tile.j))) {
      this.matchTile(next, list, search, color);
    }
    if ((next = this.getTile(tile.i, tile.j + 1))) {
      this.matchTile(next, list, search, color);
    }
    if ((next = this.getTile(tile.i, tile.j - 1))) {
      this.matchTile(next, list, search, color);
    }
  };

  moveTile = (i: number, j: number, tile: Tile) => {
    if (this.getTile(i, j)) {
      return false;
    }
    this.unsetTile(tile.i, tile.j, tile);
    tile.i = i;
    tile.j = j;
    this.setTile(i, j, tile);
    return true;
  };

  removeTile = (tile: Tile) => {
    this.unsetTile(tile.i, tile.j, tile);
    const index = this.tiles.indexOf(tile);
    if (index >= 0) {
      this.tiles.splice(index, 1);
    }
  };
}
