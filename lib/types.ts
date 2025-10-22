export interface ChargingStation {
  lat: number;
  lon: number;
  state: string;
  county: string;
  access: 'public' | 'private' | 'unknown';
  isFree: boolean;
  hover: string;
}

export interface StationFilters {
  state: string;
  access: string;
  free: string;
}

export interface StationStats {
  total: number;
  public: number;
  free: number;
  states: number;
}
