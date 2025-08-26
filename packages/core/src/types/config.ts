export interface Config {
  brand: BrandConfig;
  filters: FilterConfig;
  notify: NotifyConfig;
}

export interface BrandConfig {
  handles: string[];
  keywords: string[];
}

export interface FilterConfig {
  lang: string;
  time_range_hours: number;
}

export interface NotifyConfig {
  slack_channel: string;
}
