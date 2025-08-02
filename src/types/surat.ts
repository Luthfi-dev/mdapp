
export interface SuratField {
  id: string;
  label: string;
}

export interface AdSetting {
  enabled: boolean;
  type: 'platform' | 'manual';
  value: string; // Ad ID for platform, image data URL for manual
}

export interface Template {
  id: string;
  title: string;
  content: string;
  fields: SuratField[];
  isPro: boolean;
  ads: {
    banner: AdSetting;
    poster: AdSetting;
  };
  lastModified: string; // ISO string
  status: 'public' | 'private';
}

export interface TemplateDataToShare {
  template: string;
  fields: SuratField[];
  isPro: boolean;
}


// Duplicating PricingPlan here to avoid circular dependency issues
// by trying to import from a 'use client' file (admin/pricing/page.tsx)
export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  priceDetails: string;
  description: string;
  features: string[];
  isPopular: boolean;
  buttonText: string;
  buttonVariant: 'default' | 'outline' | 'secondary';
}
