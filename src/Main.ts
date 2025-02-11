/*
 * Copyright (c) Ali Shakiba
 * Licensed under the MIT license
 */

import * as Stage from "stage-js";
import { Middleware, Runtime } from "polymatic";

import { Loader } from "./Loader";
import { Terminal } from "./Terminal";
import { Gameplay } from "./Gameplay";
import { type Tile } from "./Model";
import { FrameLoop } from "./FrameLoop";

export interface MainContext {
  width: number;
  height: number;
  tiles: Tile[];
  stage: Stage.Root;
}

export class Main extends Middleware {
  constructor() {
    super();
    this.use(new FrameLoop());
    this.use(new Loader());
    this.use(new Terminal());
    this.use(new Gameplay());
  }
}

Runtime.activate(new Main(), { width: 8, height: 8 });
