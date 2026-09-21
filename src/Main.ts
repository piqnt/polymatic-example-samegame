/*
 * Copyright (c) Ali Shakiba
 * Licensed under the MIT license
 */

import { type Application, type Container } from "pixi.js";
import { Middleware } from "polymatic";

import { PixiManager, type Textures } from "./PixiManager";
import { Terminal } from "./Terminal";
import { Gameplay } from "./Gameplay";
import { type Tile } from "./Model";
import { FrameLoop } from "./FrameLoop";

export interface MainContext {
  width: number;
  height: number;
  tiles?: Tile[];

  pixi?: Application;
  scene?: Container;
  textures?: Textures;
}

export class Main extends Middleware<MainContext> {
  constructor() {
    super();
    this.use(new FrameLoop());
    this.use(new PixiManager());
    this.use(new Terminal());
    this.use(new Gameplay());
  }
}
