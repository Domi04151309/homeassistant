import { HomeAssistantState } from '../utilities/types';

const THRESHOLD_IN_MILLISECONDS = 120_000;

export class DebouncedDeviceTracker {
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
}
