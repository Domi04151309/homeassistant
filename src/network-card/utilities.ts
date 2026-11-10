import { HomeAssistantDevice, HomeAssistantEntity } from '../utilities/types';

export const UNKNOWN = 'unknown';

export const UNKNOWN_ICON = 'mdi:devices';

export function getMacIcon(mac: string): string {
  const uppercase = mac.toUpperCase();

  if (/^[0-9A-F][26AE]/.test(uppercase)) {
    return 'mdi:domino-mask';
  }

  switch (uppercase.slice(0, 8)) {
    case '2C:CF:67': {
      return 'mdi:server';
    }

    case '30:E0:44':
    case '64:A2:F9':
    case 'E8:D5:2B': {
      return 'mdi:cellphone';
    }

    case '8C:55:4A': {
      return 'mdi:laptop';
    }

    case '00:1D:63': {
      return 'mdi:washing-machine';
    }

    case '24:62:AB':
    case '44:17:93':
    case '58:E6:C5':
    case '90:70:69': {
      return 'mdi:puzzle-outline';
    }

    default: {
      return UNKNOWN_ICON;
    }
  }
}

export function getFritzSmartIcon(device: HomeAssistantDevice): string {
  if (device.model?.includes('Thermo')) {
    return 'mdi:thermostat';
  }

  if (device.model?.includes('Control')) {
    return 'mdi:window-closed';
  }

  if (
    device.model?.includes('RolloTron') ||
    device.model?.includes('HAN-FUN')
  ) {
    return 'mdi:blinds-horizontal';
  }

  return UNKNOWN_ICON;
}

export function getEntityIdsOfIntegration(
  entities: HomeAssistantEntity[],
  integration: string,
): Set<string> {
  return new Set(
    entities
      .filter((entity) => entity.platform === integration)
      .map((entity) => entity.entity_id ?? ''),
  );
}

export function getThemeColor(element: Element, variableName: string): string {
  return (
    getComputedStyle(element).getPropertyValue(variableName).trim() ?? '#000000'
  );
}
