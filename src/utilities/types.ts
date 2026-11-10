declare global {
  var customCards: Array<{
    type: string;
    name: string;
    description: string;
    preview: boolean;
  }>;
}

export interface HomeAssistant {
  connection?: {
    subscribeMessage: (
      callback: (message: { value?: { panelOrder?: string[] } }) => void,
      options: { type: string; key: string },
    ) => Promise<() => void>;
  };
  user?: { is_admin?: boolean };
  panels?: Record<
    string,
    { url_path?: string; icon?: string; title?: string } | undefined
  >;
  states?: Record<string, HomeAssistantState>;
  devices?: Record<string, HomeAssistantDevice>;
  entities?: Record<string, HomeAssistantEntity>;
}

export interface LovelaceConfigForm {
  schema: unknown[];
}

export interface LovelaceGridOptions {
  columns?: number | 'full';
  rows?: number | 'auto';
  max_columns?: number;
  min_columns?: number;
  min_rows?: number;
  max_rows?: number;
}

export interface HomeAssistantState {
  entity_id?: string;
  state?: string;
  attributes?: Record<string, string | undefined>;
}

export interface HomeAssistantDevice {
  id?: string;
  model?: string;
  identifiers?: string[];
  name_by_user?: string;
}

export interface HomeAssistantEntity {
  device_id?: string;
  entity_id?: string;
  platform?: string;
}
