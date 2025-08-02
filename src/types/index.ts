
import type { AdSetting } from "./surat";

export interface AppDefinition {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  isPopular: boolean;
  isNew: boolean;
  order: number;
}

export interface AppSettings {
  isPro: boolean;
  ads: {
    banner: AdSetting;
    poster: AdSetting;
  };
}

export interface PaginationSettings {
  itemsPerPage: number;
}
