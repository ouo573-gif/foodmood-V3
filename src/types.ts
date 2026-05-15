import { LucideIcon } from 'lucide-react';

export type MBEI_Code = 'MNHR' | 'MNHV' | 'MNLR' | 'MNLV' | 'MPHR' | 'MPHV' | 'MPLR' | 'MPLV' | 'PNHR' | 'PNHV' | 'PNLR' | 'PNLV' | 'PPHR' | 'PPHV' | 'PPLR' | 'PPLV';

export interface MBEIType {
  code: MBEI_Code;
  name: string;
  creature: string;
  description: string;
  insight: string;
  emoji: string;
}

export interface MealRecord {
  id: string;
  date: string;
  time: string;
  mealType: string;
  foodEmoji: string;
  foodType: 'natural' | 'processed' | 'mixed';
  mood: string;
  bodyFeeling: string;
  context: string;
  mbeiCode: MBEI_Code;
  fortune?: {
    title: string;
    verse: string[];
    advice: string[];
    fortuneType: 'warning' | 'normal' | 'blessing';
  };
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}
