// src/utils/aggregateResults.ts
import prisma from "../utils/prisma";
import { CandidateType, Region } from "@prisma/client";
import { AggregatedResults } from "../types/results";

type Scope = "presidential" | "parliamentary" | "region";

interface AggregateOptions {
  scope: Scope;
  constituencyId?: string;
  region?: Region;
}

export const aggregateResults = async ({
  scope,
  constituencyId,
  region,
}: AggregateOptions): Promise<AggregatedResults> => {
  let where: any = {};

  if (scope === "presidential") {
    where = { candidate: { type: CandidateType.PRESIDENTIAL } };
  } else if (scope === "parliamentary" && constituencyId) {
    where = {
      candidate: { type: CandidateType.PARLIAMENTARY, constituencyId },
    };
  } else if (scope === "region" && region) {
    where = { candidate: { constituency: { region } } };
  }

  const totals = await prisma.result.groupBy({
    by: ["candidateId"],
    where,
    _sum: { votes: true },
  });

  const detailedResults = await Promise.all(
    totals.map(async (r) => {
      const candidate = await prisma.candidate.findUnique({
        where: { id: r.candidateId },
        include: { party: true },
      });
      return {
        candidate,
        votes: r._sum.votes ?? 0,
      };
    })
  );

  const totalVotes = detailedResults.reduce(
    (acc, r) => acc + (r.votes || 0),
    0
  );

  const results = detailedResults.map((r) => ({
    candidateId: r.candidate?.id,
    candidateName: r.candidate?.name,
    party: r.candidate?.party,
    votes: r.votes,
    percentage: totalVotes > 0 ? (r.votes / totalVotes) * 100 : 0,
  }));

  const leadingCandidate = results.reduce(
    (prev, curr) => (prev.votes > curr.votes ? prev : curr),
    results[0]
  );

  return { totalVotes, results, leadingCandidate };
};
