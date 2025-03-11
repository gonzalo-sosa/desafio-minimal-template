export type IFlightItem = {
  flightNumber: string;
  arrivalTime: Date | string;
  airline: string;
  delayed: boolean;
  price: number;
  capacity: number;
  countryFrom: string;
  countryDestination: string;
  taxes: number;
};

export type IFlightTableFilters = {
  airline: string[];
  delayed: boolean[];
  countryFrom?: string[];
  countryDestination?: string[];
};
