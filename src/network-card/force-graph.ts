import ForceGraph, { LinkObject } from 'force-graph';
import { ExtendedNodeObject, getThemeColor, UNKNOWN } from './utilities.js';

import './mdi.js';
import { getMdiPath } from './mdi.js';

export function createForceGraph(element: HTMLElement): ForceGraph {
  const nodeRadius = 12;
  const fontSize = 12;
  const iconSize = 24;
  const iconScale = (nodeRadius * 1.2) / iconSize;
  const linkFontSize = 6;

  const primaryColor = getThemeColor(element, '--primary-color');
  const accentColor = getThemeColor(element, '--accent-color');
  const primaryTextColor = getThemeColor(element, '--primary-text-color');
  const secondaryTextColor = getThemeColor(element, '--secondary-text-color');
  const primaryBackgroundColor = getThemeColor(
    element,
    '--primary-background-color',
  );

  function getFillColor(node: ExtendedNodeObject): string {
    switch (node.group) {
      case 'disconnected': {
        return primaryBackgroundColor;
      }
      case 'hub': {
        return accentColor;
      }
      default: {
        return primaryColor;
      }
    }
  }

  function getIconColor(node: ExtendedNodeObject): string {
    switch (node.group) {
      case 'disconnected': {
        return secondaryTextColor;
      }
      default: {
        return primaryTextColor;
      }
    }
  }

  function getTextColor(node: ExtendedNodeObject): string {
    switch (node.group) {
      case 'disconnected': {
        return secondaryTextColor;
      }
      default: {
        return primaryTextColor;
      }
    }
  }

  // @ts-expect-error -- Wrong type definitions
  const graph = (ForceGraph()(element) as ForceGraph)
    .width(element.clientWidth)
    .height(element.clientHeight)
    .graphData({ nodes: [], links: [] })
    .linkDirectionalParticles(4)
    .linkDirectionalParticleSpeed(0.001)
    .linkDirectionalParticleWidth(2)
    .linkColor(() => secondaryTextColor)
    .linkCanvasObject(
      (link: LinkObject, context: CanvasRenderingContext2D): void => {
        const label = (link as { label?: string }).label ?? UNKNOWN;
        const start = link.source as ExtendedNodeObject;
        const end = link.target as ExtendedNodeObject;

        let textAngle = Math.atan2(
          (end.y ?? 0) - (start.y ?? 0),
          (end.x ?? 0) - (start.x ?? 0),
        );

        if (textAngle > Math.PI / 2) {
          textAngle = -(Math.PI - textAngle);
        }

        if (textAngle < -Math.PI / 2) {
          textAngle = -(-Math.PI - textAngle);
        }

        context.font = `${linkFontSize}px system-ui`;

        const width = context.measureText(label).width + 4;
        const height = linkFontSize + 2;
        const radius = 2;

        context.save();
        context.translate(
          ((start.x ?? 0) + (end.x ?? 0)) / 2,
          ((start.y ?? 0) + (end.y ?? 0)) / 2,
        );
        context.rotate(textAngle);

        context.beginPath();
        context.roundRect(-width / 2, -height / 2, width, height, radius);
        context.fillStyle = primaryBackgroundColor;
        context.fill();

        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = secondaryTextColor;
        context.fillText(label, 0, 0);
        context.restore();
      },
    )
    .linkLineDash((link: LinkObject & { label?: string }) =>
      ['DECT', 'WLAN', 'Zigbee'].includes(link.label ?? '') ? [4, 4] : [],
    )
    .linkCanvasObjectMode(() => 'after')
    .nodeCanvasObject(
      (
        node: ExtendedNodeObject,
        context: CanvasRenderingContext2D,
        globalScale: number,
      ): void => {
        context.beginPath();
        context.arc(
          node.x ?? 0,
          node.y ?? 0,
          nodeRadius,
          0,
          2 * Math.PI,
          false,
        );
        context.fillStyle = getFillColor(node);
        context.fill();

        const icon = getMdiPath(node.icon ?? '');
        context.save();
        context.translate(node.x ?? 0, node.y ?? 0);
        context.scale(iconScale, iconScale);
        context.translate(-iconSize / 2, -iconSize / 2);

        context.fillStyle = getIconColor(node);
        context.fill(icon);
        context.restore();

        context.font = `${fontSize / globalScale}px system-ui`;
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillStyle = getTextColor(node);
        context.fillText(
          node.name ?? '',
          node.x ?? 0,
          (node.y ?? 0) + nodeRadius + 2,
        );
      },
    );

  graph.d3Force('charge')?.strength(-200);
  graph.d3Force('link')?.distance(100);

  return graph;
}
