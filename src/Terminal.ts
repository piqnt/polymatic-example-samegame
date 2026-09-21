/*
 * Copyright (c) Ali Shakiba
 * Licensed under the MIT license
 */

import { Container, Sprite } from "pixi.js";
import { Binder, Driver, Memo, Middleware } from "polymatic";
import { Easing, TransitionManager, type TransitionSelection } from "@piqnt/transition";

import { type MainContext } from "./Main";
import { Tile } from "./Model";
import { type FrameLoopEvent } from "./FrameLoop";

// the smaller screen dimension is fitted to this many scene units
const VIEWBOX_WIDTH = 24;
const VIEWBOX_HEIGHT = 24;

// tiles are 2x2 scene units
const TILE_SIZE = 2;

export class Terminal extends Middleware<MainContext> {
  board: Container;
  transitionManager = new TransitionManager();

  constructor() {
    super();
    this.on("pixi-ready", this.handlePixiReady);
    this.on("deactivate", this.handleDeactivate);
    this.on("frame-render", this.handleFrameRender);
  }

  handlePixiReady = () => {
    const pixi = this.context.pixi;
    const scene = this.context.scene;
    const textures = this.context.textures;

    pixi.renderer.on("resize", this.handleViewport);
    this.handleViewport();

    // board is centered on the scene origin
    const boardWidth = this.context.width * TILE_SIZE;
    const boardHeight = this.context.height * TILE_SIZE;
    this.board = new Container();
    this.board.position.set(-boardWidth / 2, -boardHeight / 2);
    scene.addChild(this.board);

    // start buttons below the board, aligned to the right
    const startEasy = new Sprite(textures.easy);
    startEasy.position.set(boardWidth - 2, boardHeight + 0.5);
    startEasy.eventMode = "static";
    startEasy.cursor = "pointer";
    startEasy.on("pointertap", () => this.emit("user-start", 4));
    this.board.addChild(startEasy);

    const startHard = new Sprite(textures.hard);
    startHard.position.set(boardWidth + 0.1, boardHeight + 0.5);
    startHard.eventMode = "static";
    startHard.cursor = "pointer";
    startHard.on("pointertap", () => this.emit("user-start", 5));
    this.board.addChild(startHard);

    this.emit("user-start");
  };

  handleDeactivate = () => {
    this.context.pixi?.renderer.off("resize", this.handleViewport);
  };

  /**
   * Fit the viewbox inside the screen, and center scene origin on the screen.
   */
  handleViewport = () => {
    const pixi = this.context.pixi;
    const scene = this.context.scene;

    const screenWidth = pixi.screen.width;
    const screenHeight = pixi.screen.height;

    const scale = Math.min(screenWidth / VIEWBOX_WIDTH, screenHeight / VIEWBOX_HEIGHT);
    scene.scale.set(scale);
    scene.position.set(screenWidth / 2, screenHeight / 2);
  };

  handleFrameRender = (ev: FrameLoopEvent) => {
    if (!this.board) return;
    this.binder.data(this.context.tiles);
    this.transitionManager.update(ev.dt);
  };

  tileDriver = Driver.create<Tile, TileComponent>({
    filter: (d) => d?.type === "tile",
    enter: (tile) => {
      const component = new TileComponent(tile, this.context.textures.tiles[tile.color]);
      component.transition = this.transitionManager.select(component);
      component.on("pointertap", () => this.emit("user-click", tile));
      this.board.addChild(component);
      return component;
    },
    update: (tile, component) => {
      component.setState(tile);
    },
    exit: (tile, component) => {
      component.exit();
    },
  });

  binder = Binder.create<Tile>({
    key: (obj) => obj.key,
    drivers: [this.tileDriver],
  });
}

class TileComponent extends Sprite {
  stateMemo = Memo.init();
  // selection of this component in the transition manager
  transition: TransitionSelection<Sprite>;

  constructor(tile: Tile, texture: Sprite["texture"]) {
    super(texture);
    this.anchor.set(0.5);
    this.eventMode = "static";
    this.cursor = "pointer";
    this.position.set(tile.i * TILE_SIZE + 1, tile.j * TILE_SIZE + 1);
    this.stateMemo.update(tile.i, tile.j);
  }

  setState(tile: Tile) {
    if (this.stateMemo.update(tile.i, tile.j)) {
      this.transition
        .tween(150)
        .ease(Easing.quadOut)
        .to({ position: { x: tile.i * TILE_SIZE + 1, y: tile.j * TILE_SIZE + 1 } });
    }
  }

  exit() {
    this.eventMode = "none";
    this.transition
      .tween(100)
      .to({ alpha: 0 })
      .done(() => {
        this.removeFromParent();
        this.destroy();
      });
  }
}
