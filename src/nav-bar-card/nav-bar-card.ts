import {
  LitElement,
  html,
  css,
  type PropertyValues,
  type TemplateResult,
  CSSResult,
} from 'lit-element';
import { customElement, property, state } from 'lit/decorators.js';
import type {
  HomeAssistant,
  LovelaceConfigForm,
  LovelaceGridOptions,
} from '../utilities/types';
import { getPanelOrder, setPanelOrder } from './utilities';

@customElement('nav-bar-card')
export class NavBarCard extends LitElement {
  static styles: CSSResult = css`
    :host {
      align-items: center;
      backdrop-filter: var(--app-header-backdrop-filter, none);
      background-color: var(--app-header-background-color);
      bottom: 0;
      box-shadow: 0 -2px 12px var(--shadow-color);
      display: flex;
      justify-content: space-evenly;
      left: 0;
      padding-top: 12px;
      padding-bottom: calc(var(--safe-area-inset-bottom, 0px) + 16px);
      position: fixed;
      text-align: center;
      width: 100%;
      z-index: 4;
    }

    :host(.editMode) {
      position: static;
    }

    :host > * {
      align-items: center;
      color: var(--app-header-text-color);
      display: flex;
      gap: 4px;
      flex-direction: column;
      justify-content: center;
      text-decoration: none;
      font-weight: var(--ha-font-weight-medium);
    }

    .icon-container {
      align-items: center;
      display: flex;
      height: 32px;
      justify-content: center;
      position: relative;
      width: 56px;
    }

    .icon-container.selected:before {
      background-color: var(--app-header-text-color);
      border-radius: 16px;
      content: '';
      inset: 0;
      opacity: var(--dark-divider-opacity);
      pointer-events: none;
      position: absolute;
    }
  `;

  static getConfigForm(): LovelaceConfigForm {
    return {
      schema: [],
    };
  }

  @state() private panelOrder: string[] = [];

  private observer: IntersectionObserver | undefined = undefined;
  private unsubscribeSidebar: (() => void) | undefined = undefined;

  @property({ attribute: false }) public hass: HomeAssistant | undefined =
    undefined;
  @property({ type: Object }) public config: object | undefined = undefined;
  @property({ type: Boolean }) public editMode: boolean = false;

  private async subscribeSidebar(): Promise<void> {
    if (this.unsubscribeSidebar) {
      return;
    }

    this.panelOrder = getPanelOrder();

    this.unsubscribeSidebar = await this.hass?.connection?.subscribeMessage(
      (message) => {
        this.panelOrder = message?.value?.panelOrder ?? [];
        setPanelOrder(this.panelOrder);
      },
      { type: 'frontend/subscribe_user_data', key: 'sidebar' },
    );
  }

  private setMenuButtonVisibility(isVisible: boolean): void {
    const button = document
      .querySelector('home-assistant')
      ?.shadowRoot?.querySelector('home-assistant-main')
      ?.shadowRoot?.querySelector('ha-drawer')
      ?.querySelector('ha-panel-lovelace')
      ?.shadowRoot?.querySelector('hui-root')
      ?.shadowRoot?.querySelector('ha-menu-button');

    if (!(button instanceof HTMLElement)) {
      return;
    }

    button.style.display = isVisible ? '' : 'none';
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.subscribeSidebar();

    this.observer = new IntersectionObserver(([entry]) => {
      this.setMenuButtonVisibility(!entry.isIntersecting);
    });
    this.observer.observe(this);

    this.classList.toggle('editMode', this.editMode);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    if (this.unsubscribeSidebar) {
      this.unsubscribeSidebar();
    }

    if (this.observer) {
      this.observer.disconnect();
    }
  }

  updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('editMode')) {
      this.classList.toggle('editMode', this.editMode);
    }

    if (changedProperties.has('hass') && !this.unsubscribeSidebar) {
      this.subscribeSidebar();
    }
  }

  render(): TemplateResult {
    const isAdmin = this.hass?.user?.is_admin ?? false;
    const panels =
      this.panelOrder?.map((key) => this.hass?.panels?.[key]) ?? [];

    const elements = [
      ...panels.slice(0, 5),
      isAdmin
        ? { icon: 'mdi:cog', title: 'Settings', url_path: 'config/dashboard' }
        : {
            icon: 'mdi:account-circle',
            title: 'Profile',
            url_path: 'profile/dashboard',
          },
    ].map(
      (panel) => html`
        <a href="/${panel?.url_path}">
          <span
            class="icon-container ${
              location.pathname.includes(panel?.url_path ?? '')
                ? 'selected'
                : ''
            }"
          >
            <ha-icon .icon=${panel?.icon ?? 'mdi:view-dashboard'}></ha-icon>
          </span>
          <span>${panel?.title ?? 'Dash'}</span>
        </a>
      `,
    );

    return html`${elements}`;
  }

  setConfig(config: object): void {
    this.config = config;
  }

  getCardSize(): number {
    return 1;
  }

  getGridOptions(): LovelaceGridOptions {
    return {
      rows: 1,
      columns: 'full',
      min_rows: 1,
      max_rows: 1,
    };
  }
}

globalThis.customCards.push({
  type: 'nav-bar-card',
  name: 'Navigation bar',
  description: 'Shows a navigation bar.',
  preview: false,
});
