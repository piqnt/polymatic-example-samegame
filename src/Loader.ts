/*
 * Copyright (c) Ali Shakiba
 * Licensed under the MIT license
 */

import * as Stage from "stage-js";
import { Middleware } from "polymatic";

import image from "../media/main.png";

import { type MainContext } from "./Main";

export class Loader extends Middleware<MainContext> {
  constructor() {
    super();
    this.on("activate", this.handleActivate);
  }

  async handleActivate() {
    const stage = Stage.mount();

    await Stage.atlas({
      image: { src: image, ratio: 32 },
      textures: {
        easy: { x: 0, y: 0, width: 2, height: 2 },
        hard: { x: 2, y: 0, width: 2, height: 2 },
        "tile-1": { x: 4, y: 0, width: 2, height: 2 },
        "tile-2": { x: 6, y: 0, width: 2, height: 2 },
        "tile-3": { x: 8, y: 0, width: 2, height: 2 },
        "tile-4": { x: 10, y: 0, width: 2, height: 2 },
        "tile-5": { x: 12, y: 0, width: 2, height: 2 },
        "tile-6": { x: 14, y: 0, width: 2, height: 2 },
      },
    });

    this.setContext((context) => {
      context.stage = stage;
    });

    this.emit("stage-ready");
  }
}
