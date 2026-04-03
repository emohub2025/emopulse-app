export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
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
  resolved_at?: string;
  archived_at?: string;
  subchallenge_id?: string | null;
  external_url?: string | null;
  popularity_score?: number | null;
  winning_emotion?: string | null;
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
    // onUserUpdated: (updated: MobileUser) => void;
  }
  ResultsHistory: undefined;
  Transactions: {
    userId: string;
  }
  Achievements: {
    userId: string;
  }
  CategoryChallenges: {
    category: string;
    active: Challenge[];
    recent: Challenge[];
  };
  ChallengeDetail: {
    challenge: Challenge;
  };
  Challenge: {
    challenge: Challenge;
  };
  ChallengeCountdown: {
    challenge?: Challenge;
    challengeId?: string;
  };
  ChallengeResults: {
    challenge?: Challenge;
    challengeId?: string;
    fromHistory?: boolean;
  };
  Subchallenge: {
    challenge: Challenge;
    subchallenges: SubchallengeList[];
  };
  SponsorSubchallenge: {
    challenge: Challenge;
  };
};

// this should be removed
export interface SubchallengeList {
  id: string;
  question_text: string;
  sequence: number;
  options: {
    id: string;
    label: string;
    sequence: number;
    metadata?: {
      text?: string;
      label?: string;
      [key: string]: any;
    };
  }[];
}

export interface CycleInfo {
  batchId: string | null;
  startTime: number | null;
  durationMs: number | null;
  endTime: number | null;
  timeRemainingMs: number | null;
}

export interface FeedCategory {
  id: string;
  name: string;
  challengeCount: number;
  active: any[];
  recent: any[];
}

export interface FeedResponse {
  status: "ok";
  cycle: CycleInfo;
  categories: FeedCategory[];
}

export interface FeedChallenge {
  id: string;
  category: string;
  headline: string;
  image_url: string | null;
  snippet: string | null;
  quote: string | null;
  stat: string | null;
  winning_emotion: string | null;   // null for active, string for recent
  resolved_at: string | null;       // null for active, timestamp for recent
  //subchallenges: FeedSubchallengeSummary[];
}

export interface FeedSubchallengeSummary {
  id: string;
  question_text: string;
  winning_option?: {
    id: string;
    label: string;
  }; // present only for RECENT challenges
}

export interface ChallengeDetail {
  id: string;
  category: string;
  headline: string;
  topic: string | null;
  source: string | null;
  image_url: string | null;
  snippet: string | null;
  quote: string | null;
  stat: string | null;
  winning_emotion: string | null;
  resolved_at: string | null;

  subchallenges: {
    id: string;
    question_text: string;
    sequence: number;
    options: {
      id: string;
      label: string;
      sequence: number;
      metadata?: Record<string, any>;
    }[];
    winning_option?: {
      id: string;
      label: string;
    };
  }[];

  user_bets?: {
    subchallenge_id: string;
    option_id: string;
    amount: number;
  }[];
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
