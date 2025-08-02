
'use client';
import type { AppSettings, PaginationSettings } from "@/types";

export type { AppSettings, PaginationSettings };

// Re-exporting AdSetting for convenience in components that use it.
export type { AdSetting } from '@/types/surat';


const APP_SETTINGS_KEY = 'all_app_settings_v1';
const PAGINATION_SETTINGS_KEY = 'pagination_settings_v1';

const defaultAppSettings: AppSettings = {
  isPro: false,
  ads: {
    banner: { enabled: false, type: 'manual', value: '' },
    poster: { enabled: false, type: 'manual', value: '' },
  },
};

const defaultPaginationSettings: PaginationSettings = {
  itemsPerPage: 15,
};

// --- App Specific Settings ---

export function loadAppSettings(): { [appId: string]: AppSettings } {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(APP_SETTINGS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to load app settings:", error);
    return {};
  }
}

export function saveAppSettings(appId: string, settings: AppSettings) {
  if (typeof window === 'undefined') return;
  try {
    const allSettings = loadAppSettings();
    allSettings[appId] = settings;
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(allSettings));
  } catch (error) {
    console.error("Failed to save app settings:", error);
  }
}

// --- Global Pagination Settings ---

export function getPaginationSettings(): PaginationSettings {
  if (typeof window === 'undefined') return defaultPaginationSettings;
  try {
    const data = localStorage.getItem(PAGINATION_SETTINGS_KEY);
    return data ? JSON.parse(data) : defaultPaginationSettings;
  } catch (error) {
    console.error("Failed to load pagination settings:", error);
    return defaultPaginationSettings;
  }
}

export function savePaginationSettings(settings: PaginationSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PAGINATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save pagination settings:", error);
  }
}
