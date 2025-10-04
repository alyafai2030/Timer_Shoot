
export interface StageData {
  time: string;
  hit: boolean;
}

export interface ShooterScore {
  id: string;
  name: string;
  stages: StageData[];
  totalScore: number;
  date: string;
}
