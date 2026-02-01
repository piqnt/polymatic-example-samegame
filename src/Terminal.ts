/*
 * Copyright (c) Ali Shakiba
 * Licensed under the MIT license
 */

import * as Stage from "stage-js";
import { Dataset, Driver, Memo, Middleware } from "polymatic";

import { type MainContext } from "./Main";
import { Tile } from "./Model";

export class Terminal extends Middleware<MainContext> {
  board: Stage.Component;
  startEasy: Stage.Sprite;
  startHard: Stage.Sprite;

  constructor() {
    super();
    this.on("stage-ready", this.handleStageReady);
    this.on("frame-update", this.handleFrameUpdate);
  }

  handleStageReady = () => {
    const stage = this.context.stage;

    stage.background("#111");
    stage.viewbox(24, 24);

    this.board = Stage.component();
    this.board.appendTo(stage);
    this.board.pin({
      width: this.context.width * 2,
      height: this.context.height * 2,
      align: 0.5,
    });

    this.startEasy = Stage.sprite("easy");
    this.startEasy.appendTo(this.board);
    this.startEasy.pin({
      alignX: 1,
      alignY: 1,
      handleY: 0,
      offsetX: -2,
      offsetY: 0.5,
    });
    this.startEasy.on("click", () => this.emit("user-start", 4));

    this.startHard = Stage.sprite("hard");
    this.startHard.appendTo(this.board);
    this.startHard.pin({
      alignX: 1,
      alignY: 1,
      handleY: 0,
      offsetX: 0.1,
      offsetY: 0.5,
    });
    this.startHard.on("click", () => this.emit("user-start", 5));

    this.emit("user-start");
  };

  handleFrameUpdate = () => {
    this.binder.data(this.context.tiles);
  };

  tileDriver = Driver.create<Tile, TileComponent>({
    filter: (d) => d?.type === "tile",
    enter: (tile) => {
      const component = new TileComponent(tile);
      component.on("click", () => this.emit("user-click", tile));
      component.appendTo(this.board);
      return component;
    },
    update: (tile, component) => {
      component.setState(tile);
    },
    exit: (tile, component) => {
      component.exit();
    },
  });

  binder = Dataset.create<Tile>({
    key: (obj) => obj.key,
    drivers: [this.tileDriver],
  });
}

class TileComponent extends Stage.Sprite {
  stateMemo = Memo.init();

  constructor(tile: Tile) {
    super();
    this.texture("tile-" + tile.color);
    this.pin({ handle: 0.5 });
    this.offset(tile.i * 2 + 1, tile.j * 2 + 1);
    this.stateMemo.update(tile.i, tile.j);
  }

  setState(tile: Tile) {
    if (this.stateMemo.update(tile.i, tile.j)) {
      this.tween(150)
        .ease("quad-out")
        .offset(tile.i * 2 + 1, tile.j * 2 + 1);
    }
  }

  exit() {
    this.tween(100).alpha(0).remove();
  }
}
