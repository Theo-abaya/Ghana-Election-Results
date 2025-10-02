// src/services/candidates.ts
import api from "../api/axios";

export async function getPresidentialCandidates() {
  const { data } = await api.get("/candidates/presidential");
  return data;
}

export async function getParliamentaryCandidates(constituencyId: string) {
  const { data } = await api.get(`/candidates/parliamentary/${constituencyId}`);
  return data;
}
