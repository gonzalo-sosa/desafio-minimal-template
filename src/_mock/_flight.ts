export const FLIGHT_NUMBER_OPTIONS = [
  { value: '4M1234', label: '4M1234' },
  { value: 'AU3441', label: 'AU3441' },
  { value: 'AO123456', label: 'AO123456' },
];

export const FLIGHT_AIRLINE_OPTIONS = [
  { value: 'American Airlines', label: 'American Airlines' },
  { value: 'Delta Air Lines', label: 'Delta Air Lines' },
  { value: 'United Airlines', label: 'United Airlines' },
  { value: 'Lufthansa', label: 'Lufthansa' },
  { value: 'Emirates', label: 'Emirates' },
  { value: 'Air France', label: 'Air France' },
];

export const FLIGHT_DELAYED_OPTIONS = [
  { value: true, label: 'Delayed' },
  { value: false, label: 'On Time' },
];

export const FLIGHT_PRICE_RANGE_OPTIONS = [
  { value: '0-500', label: '$0 - $500' },
  { value: '500-1000', label: '$500 - $1000' },
  { value: '1000-2000', label: '$1000 - $2000' },
  { value: '2000+', label: '$2000+' },
];

export const FLIGHT_QUANTITY_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' },
  { value: '9', label: '9' },
  { value: '10', label: '10' },
];

export const FLIGHT_COUNTRY_OPTIONS = [
  { value: 'USA', label: 'United States' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'UAE', label: 'United Arab Emirates' },
  { value: 'Mexico', label: 'Mexico' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Japan', label: 'Japan' },
  { value: 'China', label: 'China' },
];

export const FLIGHT_TAXES_OPTIONS = [
  { value: '0', label: '0%' },
  { value: '5', label: '5%' },
  { value: '10', label: '10%' },
  { value: '15', label: '15%' },
  { value: '20', label: '20%' },
];

export const FLIGHT_SORT_OPTIONS = [
  { value: 'priceDesc', label: 'Price: High - Low' },
  { value: 'priceAsc', label: 'Price: Low - High' },
  { value: 'arrivalTimeDesc', label: 'Arrival Time: Latest' },
  { value: 'arrivalTimeAsc', label: 'Arrival Time: Earliest' },
  { value: 'airlineAsc', label: 'Airline: A - Z' },
  { value: 'airlineDesc', label: 'Airline: Z - A' },
];

export const FLIGHT_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'departed', label: 'Departed' },
  { value: 'arrived', label: 'Arrived' },
  { value: 'cancelled', label: 'Cancelled' },
];
