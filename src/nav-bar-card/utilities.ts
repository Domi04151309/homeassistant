const PANEL_ORDER_KEY = 'PANEL_ORDER_KEY';

export function getPanelOrder(): string[] {
  return JSON.parse(localStorage.getItem(PANEL_ORDER_KEY) ?? '[]');
}

export function setPanelOrder(value: string[]): void {
  return localStorage.setItem(PANEL_ORDER_KEY, JSON.stringify(value));
}
