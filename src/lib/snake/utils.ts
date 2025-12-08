import { setColor, createEmptyGrid, setColorEmpty } from "./types/grid";
import type { Color } from "./types/grid";

export type Cell = {
  x: number;
  y: number;
  date: string;
  count: number;
  level: number;
};

export const userContributionToGrid = (cells: Cell[]) => {
  const width = Math.max(0, ...cells.map((c) => c.x)) + 1;
  const height = Math.max(0, ...cells.map((c) => c.y)) + 1;

  const grid = createEmptyGrid(width, height);
  for (const c of cells) {
    if (c.level > 0) setColor(grid, c.x, c.y, c.level as Color);
    else setColorEmpty(grid, c.x, c.y);
  }

  return grid;
};
