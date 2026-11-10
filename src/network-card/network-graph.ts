import { GraphData } from 'force-graph';
import { HomeAssistant } from '../utilities/types.js';
import { DebouncedDeviceTracker } from './debounced-device-tracker.js';
import { NetworkCardConfig } from './network-card.js';
import {
  getEntityIdsOfIntegration,
  getFritzSmartIcon,
  getMacIcon,
  UNKNOWN,
  UNKNOWN_ICON,
} from './utilities.js';

const debouncedDeviceTracker = new DebouncedDeviceTracker();

export function getNetworkGraph(
  homeAssistant: HomeAssistant,
  config: NetworkCardConfig,
): GraphData {
  if (!homeAssistant || !config) {
    return { nodes: [], links: [] };
  }

  const states = Object.values(homeAssistant?.states ?? {});
  const devices = Object.values(homeAssistant?.devices ?? {});
  const entities = Object.values(homeAssistant?.entities ?? {});

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

  const hasUplink =
    states.find((state) => state.entity_id === config.internet)?.state === 'on';

  if (hasUplink) {
    links.push({ source: 'Internet', target: 'FRITZ!Box', label: 'WAN' });
  }

  // Fritz integration
  const fritzEntityIds = getEntityIdsOfIntegration(entities, 'fritz');

  for (const state of states) {
    if (
      !state.entity_id?.startsWith('device_tracker.') ||
      !fritzEntityIds.has(state.entity_id) ||
      state.state !== 'home' ||
      config.ignore.includes(state.entity_id)
    ) {
      continue;
    }

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

  // Luci integration
  const luciEntityIds = getEntityIdsOfIntegration(entities, 'luci');

  for (const state of states) {
    if (
      !state.entity_id?.startsWith('device_tracker.') ||
      !luciEntityIds.has(state.entity_id) ||
      !debouncedDeviceTracker.isHome(state) ||
      config.ignore.includes(state.entity_id)
    ) {
      continue;
    }

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

  // Hue integration
  const hueEntityIds = getEntityIdsOfIntegration(entities, 'hue');

  for (const state of states) {
    if (
      !state.entity_id?.startsWith('light.') ||
      !hueEntityIds.has(state.entity_id) ||
      ['unavailable', 'unknown'].includes(state.state ?? '') ||
      state.attributes?.is_hue_group !== undefined ||
      state.attributes?.group_type !== undefined
    ) {
      continue;
    }

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
        const state = homeAssistant.states?.[entity.entity_id ?? ''];
        return state && !['unavailable', 'unknown'].includes(state.state ?? '');
      });

    if (!isActive) {
      continue;
    }

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

  return { nodes, links };
}
