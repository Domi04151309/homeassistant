/* eslint-disable unicorn/no-break-in-nested-loop */
import { GraphData } from 'force-graph';
import {
  HomeAssistant,
  HomeAssistantDevice,
  HomeAssistantEntity,
  HomeAssistantState,
} from '../utilities/types.js';
import { DebouncedDeviceTracker } from './debounced-device-tracker.js';
import { NetworkCardConfig } from './network-card.js';
import {
  getFritzSmartIcon,
  getMacIcon,
  UNKNOWN,
  UNKNOWN_ICON,
} from './utilities.js';

const debouncedDeviceTracker = new DebouncedDeviceTracker();

export function getNetworkGraph(
  hass: HomeAssistant,
  config: NetworkCardConfig,
): GraphData {
  if (!hass || !config) {
    return { nodes: [], links: [] };
  }

  const states = hass?.states ?? {};
  const devices = Object.values(hass?.devices ?? {}) as HomeAssistantDevice[];
  const entities = Object.values(hass?.entities ?? {}) as HomeAssistantEntity[];

  const nodes = [
    {
      id: 'Internet',
      name: 'Internet',
      icon: 'mdi:web',
      group: 'hub',
    },
    {
      id: 'FRITZ!Box',
      name: 'FRITZ!Box',
      icon: 'mdi:router-wireless',
      group: 'hub',
    },
    {
      id: 'OpenWrt',
      name: 'OpenWrt',
      icon: 'mdi:router-wireless',
      group: 'hub',
    },
    {
      id: 'Philips-Hue',
      name: 'Philips-Hue',
      icon: 'mdi:square-rounded',
      group: 'hub',
    },
    {
      id: 'FRITZ!Smart',
      name: 'FRITZ!Smart',
      icon: 'mdi:signal-cellular-3',
      group: 'hub',
    },
  ];

  const links = [
    { source: 'FRITZ!Box', target: 'OpenWrt', label: 'LAN' },
    { source: 'FRITZ!Box', target: 'FRITZ!Smart', label: 'internal' },
    { source: 'OpenWrt', target: 'Philips-Hue', label: 'LAN' },
  ];

  const hasUplink = states[config.internet]?.state === 'on';

  if (hasUplink) {
    links.push({ source: 'Internet', target: 'FRITZ!Box', label: 'WAN' });
  }

  // Fritz, luci, and hue integration
  for (const entity of entities) {
    const entityId = entity.entity_id ?? '';

    if (config.ignore.includes(entityId)) {
      continue;
    }

    if (entityId.startsWith('device_tracker.')) {
      const state = states[entityId];

      if (!state || !debouncedDeviceTracker.isHome(state)) {
        continue;
      }

      switch (entity.platform) {
        case 'fritz': {
          pushFritzNode(state, nodes, links);
          break;
        }
        case 'luci': {
          pushLuciNode(state, nodes, links);
          break;
        }
      }
    }

    // eslint-disable-next-line unicorn/prefer-continue
    if (entityId.startsWith('light.')) {
      const state = states[entityId];

      if (
        !state ||
        ['unavailable', 'unknown'].includes(state.state ?? '') ||
        state.attributes?.is_hue_group !== undefined ||
        state.attributes?.group_type !== undefined
      ) {
        continue;
      }

      pushHueNode(state, nodes, links);
    }
  }

  // Fritzbox integration
  const fritzSmartDevices = new Set(
    devices.filter(
      (device) =>
        device.model && device.identifiers?.some((id) => id[0] === 'fritzbox'),
    ),
  );

  for (const device of fritzSmartDevices) {
    const isActive = entities
      .filter((entity) => entity.device_id === device.id)
      .some((entity) => {
        const state = states[entity.entity_id ?? ''];
        return !['unavailable', 'unknown'].includes(state?.state ?? '');
      });

    if (!isActive) {
      continue;
    }

    pushFritzBoxNode(device, nodes, links);
  }

  return { nodes, links };
}

function pushFritzNode(
  state: HomeAssistantState,
  nodes: unknown[],
  links: unknown[],
): void {
  nodes.push({
    id: state.entity_id ?? '',
    name: state.attributes?.host_name ?? UNKNOWN,
    icon: getMacIcon(state.attributes?.mac ?? ''),
    group: 'device',
  });

  links.push({
    source: 'FRITZ!Box',
    target: state.entity_id ?? '',
    label: state.attributes?.connection_type ?? UNKNOWN,
  });
}

function pushLuciNode(
  state: HomeAssistantState,
  nodes: unknown[],
  links: unknown[],
): void {
  nodes.push({
    id: state.entity_id ?? '',
    name: state.attributes?.host_name ?? UNKNOWN,
    icon: getMacIcon(state.attributes?.mac ?? ''),
    group: 'device',
  });

  links.push({
    source: 'OpenWrt',
    target: state.entity_id ?? '',
    label: 'WLAN',
  });
}

function pushHueNode(
  state: HomeAssistantState,
  nodes: unknown[],
  links: unknown[],
): void {
  nodes.push({
    id: state.entity_id ?? '',
    name: state.attributes?.friendly_name ?? UNKNOWN,
    icon: state.attributes?.icon ?? UNKNOWN_ICON,
    group: 'device',
  });

  links.push({
    source: 'Philips-Hue',
    target: state.entity_id ?? '',
    label: 'Zigbee',
  });
}

function pushFritzBoxNode(
  device: HomeAssistantDevice,
  nodes: unknown[],
  links: unknown[],
): void {
  nodes.push({
    id: device.id ?? '',
    name: device.name_by_user ?? UNKNOWN,
    icon: getFritzSmartIcon(device),
    group: 'device',
  });
  links.push({
    source: 'FRITZ!Smart',
    target: device.id ?? '',
    label: 'DECT',
  });
}
