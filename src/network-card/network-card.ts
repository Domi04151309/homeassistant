import {
  LitElement,
  html,
  css,
  CSSResult,
  PropertyValues,
  TemplateResult,
} from 'lit';
import { getNetworkGraph } from './network-graph.js';
import { createForceGraph } from './force-graph.js';
import { customElement, property } from 'lit/decorators.js';
import {
  HomeAssistant,
  LovelaceConfigForm,
  LovelaceGridOptions,
} from '../utilities/types.js';
import ForceGraph from 'force-graph';

export interface NetworkCardConfig {
  internet: string;
  ignore: string[];
}

@customElement('network-card')
export class NetworkCard extends LitElement {
  static styles: CSSResult = css`
    :host {
      display: block;
      inset: 0;
      position: fixed;
    }

    :host(.editMode) {
      height: 100%;
      position: static;
      width: 100%;
    }

    #graph {
      height: 100%;
      width: 100%;
    }
  `;

  static getConfigForm(): LovelaceConfigForm {
    return {
      schema: [
        {
          name: 'internet',
          required: true,
          selector: { entity: { domain: 'binary_sensor' } },
        },
        {
          name: 'ignore',
          required: false,
          selector: { entity: { domain: 'device_tracker', multiple: true } },
        },
      ],
    };
  }

  static getStubConfig(hass: HomeAssistant): NetworkCardConfig {
    const states = Object.keys(hass?.states ?? {});

    const internet =
      states.find(
        (entityId) =>
          entityId.startsWith('binary_sensor.') &&
          entityId.includes('connection'),
      ) ?? '';

    const ignore = states.filter(
      (entityId) =>
        entityId.startsWith('device_tracker.') &&
        (entityId.includes('fritz') ||
          entityId.includes('openwrt') ||
          entityId.includes('hue')),
    );

    return {
      internet,
      ignore,
    };
  }

  private graph: ForceGraph | undefined = undefined;
  private resizeObserver: ResizeObserver | undefined = undefined;

  @property({ attribute: false }) public hass: HomeAssistant | undefined =
    undefined;
  @property({ type: Object }) public config: NetworkCardConfig | undefined =
    undefined;
  @property({ type: Boolean }) public editMode: boolean = false;

  private initializeGraph(): void {
    const container = this.shadowRoot?.getElementById('graph');

    if (!container || this.graph) {
      return;
    }

    this.graph = createForceGraph(container);

    this.classList.toggle('editMode', this.editMode);
    this.updateGraphData();
  }

  private updateGraphData(): void {
    if (!this.hass || !this.config || !this.graph) {
      return;
    }

    const currentData = this.graph.graphData();
    const updatedData = getNetworkGraph(this.hass, this.config);

    if (
      currentData.nodes.length === updatedData.nodes.length &&
      currentData.links.length === updatedData.links.length
    ) {
      return;
    }

    const nodeMap = new Map(currentData.nodes.map((node) => [node.id, node]));
    const nodes = updatedData.nodes.map((node) => nodeMap.get(node.id) ?? node);

    this.graph.graphData({ nodes, links: updatedData.links });
  }

  private initializeResizeObserver(): void {
    const container = this.shadowRoot?.getElementById('graph');

    if (!container) {
      return;
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        if (this.graph && width > 0 && height > 0) {
          this.graph.width(width).height(height);
        }
      }
    });

    this.resizeObserver.observe(container);
  }

  firstUpdated(): void {
    this.initializeGraph();
    this.initializeResizeObserver();
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('editMode')) {
      this.classList.toggle('editMode', this.editMode);
    }

    if (changedProperties.has('hass') && this.hass) {
      this.updateGraphData();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  render(): TemplateResult {
    return html`<div id="graph"></div>`;
  }

  setConfig(config: Partial<NetworkCardConfig>): void {
    this.config = {
      internet: '',
      ignore: [],
      ...config,
    };
  }

  getCardSize(): number {
    return 12;
  }

  getGridOptions(): LovelaceGridOptions {
    return {
      rows: 12,
      columns: 'full',
      min_rows: 12,
      max_rows: 12,
    };
  }
}

globalThis.customCards.push({
  type: 'network-card',
  name: 'Network card',
  description: 'Shows the network as a graph.',
  preview: false,
});
