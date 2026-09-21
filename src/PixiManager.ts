/*
 * Copyright (c) Ali Shakiba
 * Licensed under the MIT license
 */

import { Application, Assets, Container, Rectangle, Texture } from "pixi.js";
import { Middleware } from "polymatic";

import menuImage from "../media/menu.png";
import tileImage from "../media/tile.png";

import { type MainContext } from "./Main";
import { type FrameLoopEvent } from "./FrameLoop";

export interface Textures {
  tiles: Record<number, Texture>;
  easy: Texture;
  hard: Texture;
}

/**
 * Creates and owns the Pixi application, loads textures, and drives Pixi's
 * ticker from the FrameLoop so there is a single loop.
 */
export class PixiManager extends Middleware<MainContext> {
  constructor() {
    super();
    this.on("activate", this.handleActivate);
    this.on("deactivate", this.handleDeactivate);
    this.on("frame-after", this.handleFrameAfter);
  }

  handleActivate = async () => {
    // Textures
    // Images are loaded at pixel ratio 64, so one scene unit is 64 pixels,
    // and each texture below is 2x2 scene units.
    const tileAtlas = await Assets.load<Texture>({ src: tileImage, data: { resolution: 64 } });
    const menuAtlas = await Assets.load<Texture>({ src: menuImage, data: { resolution: 64 } });
    const ppu = 2;
    const cell = (atlas: Texture, x: number, y: number) =>
      new Texture({
        source: atlas.source,
        frame: new Rectangle(x * ppu, y * ppu, ppu, ppu),
      });

    const textures: Textures = {
      tiles: {
        1: cell(tileAtlas, 1, 0),
        2: cell(tileAtlas, 2, 0),
        3: cell(tileAtlas, 3, 0),
        4: cell(tileAtlas, 4, 0),
        5: cell(tileAtlas, 5, 0),
        6: cell(tileAtlas, 6, 0),
      },
      easy: cell(menuAtlas, 0, 0),
      hard: cell(menuAtlas, 1, 0),
    };

    const pixi = new Application();
    await pixi.init({
      resizeTo: window,
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
      // ticker is updated manually in handleFrameAfter, see FrameLoop
      autoStart: false,
    });
    document.body.appendChild(pixi.canvas);

    // scene container, scaled and centered by Terminal to fit the viewbox
    const scene = new Container();
    pixi.stage.addChild(scene);

    this.setContext((context) => {
      context.pixi = pixi;
      context.scene = scene;
      context.textures = textures;
    });

    this.emit("pixi-ready");
  };

  handleDeactivate = () => {
    this.context.pixi?.destroy({ removeView: true }, { children: true });
  };

  handleFrameAfter = (ev: FrameLoopEvent) => {
    if (!this.context.pixi) return;
    // runs ticker listeners and then renders the stage
    this.context.pixi.ticker.update(ev.now);
  };
}
