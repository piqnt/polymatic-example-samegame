/*
 * Copyright (c) Ali Shakiba
 * Licensed under the MIT license
 */

import { nanoid } from "nanoid";

export class Tile {
  key = "tile-" + nanoid(6);
  type = "tile" as const;

  i: number;
  j: number;
  color: any;

  search: any;

  constructor(color: any) {
    this.color = color;
  }
}
