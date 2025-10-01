// src/utils/prismaMiddleware.ts
import prisma from "./prisma";

// Prisma middleware for auditing
prisma.$use(async (params: any, next: (params: any) => Promise<any>) => {
  if (params.model === "AuditLog") return next(params);

  let oldValue: any = null;

  if (params.action === "update" || params.action === "delete") {
    try {
      if (params.args?.where) {
        oldValue = await (prisma as any)[params.model.toLowerCase()].findUnique(
          {
            where: params.args.where,
          }
        );
      }
    } catch (err) {
      console.warn(`Could not fetch oldValue for ${params.model}:`, err);
    }
  }

  const result = await next(params);

  const actionsToLog = ["create", "update", "delete"];
  if (params.model && actionsToLog.includes(params.action)) {
    try {
      const entityId = result?.id ? String(result.id) : "unknown";

      await prisma.auditLog.create({
        data: {
          action: `${params.model.toUpperCase()}_${params.action.toUpperCase()}`,
          entity: params.model,
          entityId,
          oldValue: oldValue ?? null,
          newValue: result ?? null,
          userId: "system", // override at controller level later
        },
      });
    } catch (err) {
      console.error("Audit middleware error:", err);
    }
  }

  return result;
});
