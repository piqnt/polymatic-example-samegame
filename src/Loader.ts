/*
 * Copyright (c) Ali Shakiba
 * Licensed under the MIT license
 */

import * as Stage from "stage-js";
import { Middleware } from "polymatic";

import menuImage from "../media/menu.png";
import tileImage from "../media/tile.png";

import { type MainContext } from "./Main";

export class Loader extends Middleware<MainContext> {
  constructor() {
    super();
    this.on("activate", this.handleActivate);
  }

  async handleActivate() {
    const stage = Stage.mount();

    await Stage.atlas({
      image: { src: tileImage, ratio: 64 },
      ppu: 2, // point per unit of texture definition below
      textures: {
        "": { x: 0, y: 0, width: 1, height: 1 },
        "tile-1": { x: 1, y: 0, width: 1, height: 1 },
        "tile-2": { x: 2, y: 0, width: 1, height: 1 },
        "tile-3": { x: 3, y: 0, width: 1, height: 1 },
        "tile-4": { x: 4, y: 0, width: 1, height: 1 },
        "tile-5": { x: 5, y: 0, width: 1, height: 1 },
        "tile-6": { x: 6, y: 0, width: 1, height: 1 },
        "cell": { x: 7, y: 0, width: 1, height: 1 },
      },
    });

    await Stage.atlas({
      image: { src: menuImage, ratio: 64 },
      ppu: 2, // point per unit of texture definition below
      textures: {
        easy: { x: 0, y: 0, width: 1, height: 1 },
        hard: { x: 1, y: 0, width: 1, height: 1 },
      },
    });

    this.setContext((context) => {
      context.stage = stage;
    });

    this.emit("stage-ready");
  }
}
