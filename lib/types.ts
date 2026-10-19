export type Board = 'Women' | 'Men' | 'Curve';

export interface Exp {
  c: string;
  y: number | string;
  k: string;
}

export interface Model {
  id: string;
  name: string;
  board: Board;
  city: string;
  age: number | null;
  h: number;
  bust: number;
  waist: number;
  hips: number;
  shoe: number;
  hair: string;
  eyes: string;
  langs: string[];
  ig: string;
  bio: string;
  exp: Exp[];
  photos: Record<string, string>;
  portfolio: string[];
  pal: string[];
  seed: number;
  isNew: boolean;
  mine: boolean;
}

export interface Draft {
  name: string;
  stage: string;
  board: Board;
  dob: string;
  city: string;
  h: string;
  bust: string;
  waist: string;
  hips: string;
  shoe: string;
  hair: string;
  eyes: string;
  langs: string[];
  bio: string;
  exp: Exp[];
  ig: string;
  email: string;
  phone: string;
  gName: string;
  gPhone: string;
  photos: Record<string, string>;
  portfolio: string[];
  ok1: boolean;
  ok2: boolean;
  okG: boolean;
  status?: 'pending' | 'live';
  submitted?: number;
}
