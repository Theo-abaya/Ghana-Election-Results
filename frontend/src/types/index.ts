// Candidate Types
export interface Party {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: Party;
  votes?: number;
  percentage?: number;
  imageUrl?: string;
}

// Region Types
export interface Region {
  id: string;
  name: string;
  registeredVoters: number;
  constituencies: number;
  pollingStations: number;
  totalVotes: number;
  turnout: number;
  leadingParty: string;
}

export interface RegionResult {
  region: { name: string; constituencies: number };
  presidential: {
    candidates: Array<{
      name: string;
      party: { abbreviation: string; color: string };
      votes: number;
      percentage: number;
    }>;
    totalVotes: number;
    leadingParty: string;
  };
  parliamentary: {
    constituencies: Array<{
      constituencyName: string;
      winner: { name: string; party: string; votes: number } | null;
      totalVotes: number;
    }>;
    totalSeats: number;
  };
  stats: {
    registeredVoters: number;
    totalVotesCast: number;
    rejectedVotes: number;
    turnout: number;
    totalPollingStations: number;
  };
}

// Constituency Types
export interface Constituency {
  id: string;
  name: string;
  region: string;
  pollingStations: number;
  regionName: string;
  registeredVoters: number;
  totalVotes: number;
  turnout: number;
  winner?: {
    candidateName: string;
    party: string;
    votes: number;
  };
}

export interface ConstituencyResult {
  constituencyId: string;
  winner: {
    candidateName: string;
    party: string;
    votes: number;
    percentage: number;
  } | null;
  stats: {
    totalVotes: number;
    reportingStations: number;
    totalPollingStations: number;
    reportingPercentage: number;
  };
}

// Election Results Types
export interface ElectionResults {
  presidential: {
    candidates: Candidate[];
    totalVotes: number;
    validVotes: number;
    rejectedVotes: number;
  };
  parliamentary: {
    constituencies: Constituency[];
    partySeats: Record<string, number>;
  };
  regional: {
    regions: Region[];
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface CandidateResult {
  id: string;
  name: string;
  party: {
    name: string;
    abbreviation: string;
    color: string;
  };
  votes: number;
  percentage: number;
}

export interface NationalStats {
  totalVotes: number;
  validVotes: number;
  rejectedVotes: number;
  turnout: number;
  reportingStations: number;
  totalStations: number;
}
