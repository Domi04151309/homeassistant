import * as mdiIcons from '@mdi/js';

const pathCache = new Map();

export function getMdiPath(iconName: string): Path2D {
  if (pathCache.has(iconName)) {
    return pathCache.get(iconName);
  }

  const camelCase = iconName
    .replaceAll(':', '-')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
    .replace(/^./, (character) => character.toLowerCase());

  const pathData =
    (mdiIcons as Record<string, string | undefined>)[camelCase] ??
    mdiIcons.mdiHelp;
  const path2d = new Path2D(pathData);

  pathCache.set(iconName, path2d);
  return path2d;
}
