
export interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  WIN = 'WIN',
  LEADERBOARD = 'LEADERBOARD'
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  level: number;
  date: string;
}

export interface GameState {
  playerName: string;
  currentQuestion: Question | null;
  score: number;
  level: number;
  skipsLeft: number;
  hintUsedForCurrent: boolean;
  status: GameStatus;
  isLoading: boolean;
  lastError: string | null;
}
