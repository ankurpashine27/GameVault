/**
 * 2048 — Predefined obstacle cell patterns per grid size.
 */

export const PATTERNS = {
  3: [
    { name: 'Center', cells: [{ r: 1, c: 1 }] },
  ],
  4: [
    { name: 'Center Block', cells: [{ r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 1 }, { r: 2, c: 2 }] },
    { name: 'Diagonal',     cells: [{ r: 0, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 2 }, { r: 3, c: 3 }] },
    { name: 'Corner Posts', cells: [{ r: 0, c: 0 }, { r: 0, c: 3 }, { r: 3, c: 0 }, { r: 3, c: 3 }] },
  ],
  5: [
    { name: 'Cross',    cells: [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 0, c: 2 }, { r: 1, c: 2 }, { r: 3, c: 2 }, { r: 4, c: 2 }] },
    { name: 'Ring',     cells: [{ r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 2, c: 1 }, { r: 2, c: 3 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }] },
    { name: 'Scattered',cells: [{ r: 0, c: 2 }, { r: 2, c: 0 }, { r: 2, c: 4 }, { r: 4, c: 2 }, { r: 1, c: 3 }, { r: 3, c: 1 }] },
  ],
  6: [
    { name: 'Inner Ring', cells: [{ r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 2, c: 1 }, { r: 2, c: 4 }, { r: 3, c: 1 }, { r: 3, c: 4 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }] },
    { name: 'Divider',   cells: [{ r: 0, c: 2 }, { r: 1, c: 2 }, { r: 2, c: 2 }, { r: 3, c: 3 }, { r: 4, c: 3 }, { r: 5, c: 3 }] },
    { name: 'Corners',   cells: [{ r: 0, c: 0 }, { r: 0, c: 5 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 5, c: 0 }, { r: 5, c: 5 }] },
  ],
  8: [
    { name: 'Maze',        cells: [{ r: 0, c: 2 }, { r: 1, c: 2 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 3, c: 4 }, { r: 4, c: 4 }, { r: 4, c: 5 }, { r: 5, c: 5 }, { r: 6, c: 5 }, { r: 7, c: 5 }] },
    { name: 'Quad Corners',cells: [{ r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 1 }, { r: 1, c: 5 }, { r: 1, c: 6 }, { r: 2, c: 6 }, { r: 5, c: 1 }, { r: 6, c: 1 }, { r: 6, c: 2 }, { r: 5, c: 6 }, { r: 6, c: 5 }, { r: 6, c: 6 }] },
    { name: 'Diamond',     cells: [{ r: 3, c: 0 }, { r: 4, c: 0 }, { r: 0, c: 3 }, { r: 0, c: 4 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 7, c: 3 }, { r: 7, c: 4 }] },
  ],
}
