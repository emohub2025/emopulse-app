export interface Challenge {
  id: string;
  topic: string;
  snippet?: string | null;
  quote?: string | null;
  image_url?: string | null;
  stat?: string | null;
  source?: string | null;
  category: string;
  status?: string;
  expires_at?: string; // ISO timestamp
  subchallenge_id?: string | null;
  external_url?: string | null;
  popularity_score?: number | null;
  audit_log?: any[] | null;
}

export type RootStackParamList = {
  CategoryList: undefined;

  HomePage: undefined;
  Login: undefined;
  Signup: undefined;
  CategoryChallenges: {
    category: string;
  };
  ChallengeDetail: {
    id: string;
    category: string;
  };
  Challenge: {
    challenge: Challenge;
  };
  ChallengeResults: {
    challenge: Challenge;
  };
  Subchallenge: {
    challenge: Challenge;
    subchallenges: SubchallengeList[];
  };
  SponsorSubchallenge: {
    challenge: Challenge;
  };
};

export interface SubchallengeList {
  id: string;
  question_text: string;
  options: { text: string; label: string }[];
  sequence: number;
}

export interface SubchallengeTemplate {
  id: string;
  question_text: string;
  category: string;
  keywords: string[];
  options: string[]; // from JSONB
  seasonal_start: string | null;
  seasonal_end: string | null;
  active: boolean;
  challenge_period_ms: number | null;
  image_url?: string;
}

export interface UserSubchallengeResponse {
  id: string;
  user_id: string;
  challenge_id: string;
  subchallenge_id: string;
  option_text: string;
  dont_ask_again: boolean;
  created_at: string;
}

export type SubchallengeScreenParams = {
  challengeId: string;
  subchallengeId: string;
};
