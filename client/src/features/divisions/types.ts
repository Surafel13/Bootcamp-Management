export interface Division {
  _id?: number;
  name: string;
  description: string;
}

export interface DivisionResponse {
  status: string;
  results?: number;
  data: Division[];
}