import { ChallengeResult } from "../api/getChallengeResults";

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
  url: string;
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
  polling_answers?: number | null;
  winning_emotion?: string | null;
  audit_log?: any[] | null;
}

export type RootStackParamList = {
  CategoryList: undefined;
  HomePage: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  Signup: undefined;
  Account: undefined;
  ResultsHistory: undefined;
  Transactions: undefined;
  Achievements: undefined;
  PrizesAndRewards: undefined;
  HelpAndSupport: undefined;
  Feedback: undefined;
  Settings: undefined;
  PrizesRewards: undefined;
  Teams: undefined;
  Leaderboard: undefined;
  PollingList: undefined;

  Profile: {
    user: MobileUser;
  };

  LiveChallenges: undefined;

  CategoryChallenges: {
    category: string;
  };

  ChallengeDetail: {
    challengeId: string;
  };

  Challenge: {
    challengeId: string;
  };

  ChallengeCountdown: {
    challengeId: string;
    from?: "play" | "live";
  };

  ChallengeResults: {
    challenge?: Challenge;
    challengeId?: string;
    fromHistory?: boolean;
    batchId?: string | null;
    mode?: "rss" | "poll";
    results?: ChallengeResult;
  };

  Subchallenge: {
    challengeId: string;
    subchallenges: SubchallengeList[];
    showBack?: boolean;
  };

  PollingChallenge: {
    challengeId: string;
  };
};

export const CATEGORIES = {
  Wacky: {
    color: '#1b359c',
    label: 'Wacky Pulse',
  },
  Entertainment: {
    color: '#ff00cc',
    label: 'Entertainment',
  },
  Sports: {
    color: '#00c6ff',
    label: 'Sports',
  },
  Politics: {
    color: '#35db1b',
    label: 'Politics',
  },
  Music: {
    color: '#1b359c',
    label: 'Music',
  },
  Tech: {
    color: '#f8990a',
    label: 'Science & Technology',
  },
  Finance: {
    color: '#1b9a01',
    label: 'Finance',
  },
  Gaming: {
    color: '#a4b90b',
    label: 'Gaming',
  },
  Health: {
    color: '#e10000',
    label: 'Health',
  },
} as const;

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

export type CycleMode = "rss" | "poll";

export interface CycleInfo {
  mode: CycleMode;
  batchId: string | null;
  startTime: number | null;
  durationMs: number | null;
  endTime: number | null;
  timeRemainingMs: number | null;
  status?: "active" | "expired";
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
  source: string;
  image_url: string | null;
  snippet: string | null;
  quote: string | null;
  stat: string | null;
  winning_emotion: string | null;
  resolved_at: string | null;
}

export interface FeedSubchallengeSummary {
  id: string;
  question_text: string;
  winning_option?: {
    id: string;
    label: string;
  };
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
  options: string[];
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

export interface LiveEmotionCount {
  count: number;
  total: number;
}

export interface LiveMain {
  // Emotion challenges
  angry?: LiveEmotionCount;
  happy?: LiveEmotionCount;
  sad?: LiveEmotionCount;
  anxious?: LiveEmotionCount;

  // Polling challenges
  poll_results?: LivePollResult[];
}

export interface LivePollResult {
  index: number;
  pct: number;
}

export interface LiveSnapshotItem {
  id: string;
  status: "open" | "closed" | "resolved";
  topic: string;
  category: string;              // single category from backend
  quote: string | null;
  stat: string | null;
  snippet: string | null;
  image_url: string | null;
  url: string | null;
  source: string;                // e.g. "polling", "wacky", etc.
  polling_answers: string[];     // from backend
  isPoll: boolean;               // from backend
  main: LiveMain;
  subchallenges: Record<string, any>;
}

export interface LiveSnapshotResponse {
  snapshot: LiveSnapshotItem[];
}
