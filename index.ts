import { Middleware } from "polymatic";

import { Main } from "./src/Main";

Middleware.activate(new Main(), { width: 8, height: 8 });
