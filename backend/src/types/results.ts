// src/types/results.ts
import { Party } from "@prisma/client";

export interface CandidateResult {
  candidateId: string | undefined;
  candidateName: string | undefined;
  party: Party | undefined;
  votes: number;
  percentage: number;
}

export interface AggregatedResults {
  totalVotes: number;
  results: CandidateResult[];
  leadingCandidate: CandidateResult;
}
