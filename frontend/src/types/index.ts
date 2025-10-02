// src/types/index.ts

export interface Party {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
}

export interface Candidate {
  id: string;
  name: string;
  type: "PRESIDENTIAL" | "PARLIAMENTARY";
  party: Party;
  constituencyId?: string; // only for parliamentary
}

export interface Constituency {
  id: string;
  name: string;
  region: string;
}

export interface PollingStation {
  id: string;
  name: string;
  code: string;
  constituencyId: string;
}

export interface Result {
  id: string;
  candidateId: string;
  pollingStationId: string;
  votes: number;
}

export interface User {
  id: string;
  email: string;
  role: "ADMIN" | "POLLING_OFFICER" | "VIEWER";
  token?: string; // used on frontend for auth
}
