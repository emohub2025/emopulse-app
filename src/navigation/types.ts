export type LoginResponse = {
  token: string;
  userId: number;
  walletId: number;
};

export type Transaction = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  transaction_date: string;
  challenge_id: string | null;
};

export interface MobileUser {
  id: string;
  first_name: string;
  email: string;
  state?: string;
  birthdate?: string;
  created_at?: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  tiktok_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  reddit_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  profile_image?: string;
  id_uuid?: string;
  user_type: string;
  coin_balance: string;
  avatar_url: string;
}

export type MobileUserUpdate = {
  first_name?: string;
  email?: string;
  state?: string;
  birthdate?: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  tiktok_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  reddit_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  profile_image?: string;
  user_type?: string;
};

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
  Account: undefined;
  HelpAndSupport: undefined;
  Settings: undefined;
  Teams: undefined;
  Profile: {
    user: MobileUser;
    onUserUpdated: (updated: MobileUser) => void;
  }
  Transactions: {
    userId: string;
  }
  Achievements: {
    userId: string;
  }
  CategoryChallenges: {
    category: string;
  };
  ChallengeDetail: {
    challenge: Challenge;
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
