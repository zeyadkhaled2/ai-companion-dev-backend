CREATE TABLE "LoginDay" (
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    CONSTRAINT "LoginDay_pkey" PRIMARY KEY ("userId", "day"),
    CONSTRAINT "LoginDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
