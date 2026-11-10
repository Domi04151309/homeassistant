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
