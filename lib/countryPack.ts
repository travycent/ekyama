import ug from "@/data/countries/ug.json";

export interface CountryPack {
  code: string;
  name: string;
  languages: string[];
  hotlines: {
    id: string;
    name: Record<string, string>;
    number: string;
    operator: string;
    notes: string;
    verified: boolean;
    sourceUrl: string | null;
    lastVerified: string;
  }[];
  organizations: {
    id: string;
    name: string;
    servesMale: boolean;
    servesFemale: boolean;
    description: string;
    sourceUrl: string | null;
    lastVerified: string;
    verified: boolean;
  }[];
  legal: {
    id: string;
    title: Record<string, string>;
    summary: string;
    penalty: string | null;
    sourceUrl: string | null;
    lastVerified: string;
    verified: boolean;
  }[];
}

const packs: Record<string, CountryPack> = {
  UG: ug as CountryPack,
};

export function getCountryPack(code: string = "UG"): CountryPack {
  return packs[code] ?? packs.UG;
}

export function listCountryCodes(): string[] {
  return Object.keys(packs);
}
