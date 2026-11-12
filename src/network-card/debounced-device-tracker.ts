import { HomeAssistant, HomeAssistantState } from '../utilities/types';

const THRESHOLD_IN_MILLISECONDS = 120_000;

class DebouncedDeviceTracker {
  seen = new Map();

  isHome(state: HomeAssistantState) {
    const now = Date.now();

    if (state.state === 'home') {
      this.seen.set(state.entity_id, now);
      return true;
    }

    const lastSeen = this.seen.get(state.entity_id);
    return lastSeen && now - lastSeen <= THRESHOLD_IN_MILLISECONDS;
  }

  startDeviceTracking(): void {
    const hass = document.querySelector<HTMLElement & { hass: HomeAssistant }>(
      'home-assistant',
    )?.hass;

    if (!hass) {
      return;
    }

    hass.connection?.subscribeEvents((event) => {
      const state = event.data?.new_state;

      if (!state?.entity_id?.startsWith('device_tracker.')) {
        return;
      }

      this.isHome(state);
    }, 'state_changed');
  }
}

export const debouncedDeviceTracker = new DebouncedDeviceTracker();

debouncedDeviceTracker.startDeviceTracking();
