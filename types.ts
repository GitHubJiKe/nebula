export enum EditorMode {
  EDIT = 'EDIT',
  SPLIT = 'SPLIT',
  PREVIEW = 'PREVIEW'
}

export interface ChartData {
  name: string;
  [key: string]: number | string;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'area' | 'pie';
  data: ChartData[];
  xKey: string;
  series: {
    key: string;
    color: string;
  }[];
  title?: string;
}

export interface D3VizConfig {
  type: 'gauge' | 'progress';
  value: number;
  label: string;
  color?: string;
}

export enum AIAction {
  SUMMARIZE = 'SUMMARIZE',
  FIX_GRAMMAR = 'FIX_GRAMMAR',
  EXPAND = 'EXPAND',
  TECH_POLISH = 'TECH_POLISH'
}
