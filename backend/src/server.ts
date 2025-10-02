import app from "./app";
import "./utils/prismaMiddleware"; // register middleware before any controllers import prisma
import prisma from "./utils/prisma";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
