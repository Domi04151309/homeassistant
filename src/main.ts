import './nav-bar-card/nav-bar-card';
import './utilities/ha-icon';

import { NavBarCard } from './nav-bar-card/nav-bar-card';
import { HomeAssistant } from './utilities/types';

const HOME_ASSISTANT: HomeAssistant = {
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
};

const navBarCard = document.querySelector<NavBarCard>('nav-bar-card')!;
navBarCard.setConfig({});
navBarCard.homeAssistant = HOME_ASSISTANT;
