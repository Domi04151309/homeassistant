import './components';
import './utilities/ha-icon';

import { NavBarCard } from './nav-bar-card/nav-bar-card';
import { NetworkCard } from './network-card/network-card';
import { HomeAssistant } from './utilities/types';

const BINARY_SENSOR_CONNECTION = 'binary_sensor.connection';
const DEVICE_TRACKER_FRITZ_BOX = 'device_tracker.fritz_box';
const DEVICE_TRACKER_OPEN_WRT = 'device_tracker.open_wrt';
const LIGHT_HUE = 'light.hue';
const FRITZ_SMART = 'fritz_smart';

const HOME_ASSISTANT = {
  connection: {
    subscribeMessage(
      callback: (message: { value?: { panelOrder?: string[] } }) => void,
    ): Promise<() => void> {
      callback({ value: { panelOrder: ['panel', 'panel', 'panel', 'panel'] } });
      return Promise.resolve(() => {});
    },
  },
  user: { is_admin: false },
  panels: { panel: {} },
  states: {
    'binary_sensor.connection': {
      entity_id: BINARY_SENSOR_CONNECTION,
      state: 'on',
    },
    'device_tracker.fritz_box': {
      entity_id: DEVICE_TRACKER_FRITZ_BOX,
      state: 'home',
      attributes: {
        host_name: DEVICE_TRACKER_FRITZ_BOX,
        connection_type: DEVICE_TRACKER_FRITZ_BOX,
      },
    },
    'device_tracker.open_wrt': {
      entity_id: DEVICE_TRACKER_OPEN_WRT,
      state: 'home',
      attributes: {
        host_name: DEVICE_TRACKER_OPEN_WRT,
      },
    },
    'light.hue': {
      entity_id: LIGHT_HUE,
      state: 'string',
      attributes: {
        friendly_name: LIGHT_HUE,
        icon: 'mdi:lightbulb',
      },
    },
    fritz_smart: {
      state: 'string',
    },
  },
  devices: {
    fritz_smart: {
      id: FRITZ_SMART,
      model: 'string',
      identifiers: [['fritzbox']],
      name_by_user: FRITZ_SMART,
    },
  },
  entities: {
    'device_tracker.fritz_box': {
      entity_id: DEVICE_TRACKER_FRITZ_BOX,
      platform: 'fritz',
    },
    'device_tracker.open_wrt': {
      entity_id: DEVICE_TRACKER_OPEN_WRT,
      platform: 'luci',
    },
    'light.hue': {
      entity_id: LIGHT_HUE,
      platform: 'hue',
    },
    fritz_smart: {
      entity_id: FRITZ_SMART,
      device_id: FRITZ_SMART,
    },
  },
} as HomeAssistant;

const navBarCard = document.querySelector<NavBarCard>('nav-bar-card')!;
navBarCard.setConfig({});
navBarCard.hass = HOME_ASSISTANT;

const networkCard = document.querySelector<NetworkCard>('network-card')!;
networkCard.setConfig({ internet: BINARY_SENSOR_CONNECTION, ignore: [] });
networkCard.hass = HOME_ASSISTANT;
