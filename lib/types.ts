export type Flight = {
  id: string;
  from: string;
  to: string;
  airline?: string;
  flightNo?: string;
  date?: string;
  time?: string;
  pnr?: string;
  terminal?: string;
  cabin?: string;
  notes?: string;
  attachment?: string;
};

export type Hotel = {
  id: string;
  name: string;
  area?: string;
  checkIn?: string;
  checkOut?: string;
  bookingRef?: string;
  address?: string;
  cost?: string;
  notes?: string;
  attachment?: string;
};

export type Cab = {
  id: string;
  type: "cab" | "transfer" | "local" | "cruise" | "train" | "other";
  from: string;
  to: string;
  provider?: string;
  time?: string;
  cost?: string;
  notes?: string;
  attachment?: string;
};

export type Attachment = {
  id: string;
  name: string;
  url?: string;
  kind: "pdf" | "image" | "link" | "other";
  note?: string;
};

export type PhotographyRule = {
  allowed: string;
  tripod?: string;
  drone?: string;
  commercial?: string;
  notes?: string;
};

export type Activity = {
  time: string;
  title: string;
};

export type DayNode = {
  id: string;
  date: string;
  base: string;
  emoji: string;
  plan: string;
  flights: Flight[];
  hotels: Hotel[];
  cabs: Cab[];
  attachments: Attachment[];
  notes?: string;
  color?: string;
  photography?: PhotographyRule;
  activities?: Activity[];
};

export type Trip = {
  id: string;
  title: string;
  country: string;
  startDate: string;
  endDate: string;
  days: DayNode[];
  budget?: number;
  cover?: string;
};

export type DestinationGroup = {
  base: string;
  emoji: string;
  days: DayNode[];
  startDate: string;
  endDate: string;
  nights: number;
  cover: string;
};
