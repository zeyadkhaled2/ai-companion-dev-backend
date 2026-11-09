import { prisma } from '../../shared/database/prisma';

const DAY_MS = 86_400_000;

// The input is ordered by date and unique per account, as enforced by the database.
export function summarizeStreak(days: Date[], today: Date) {
  let previous: number | undefined;
  let run = 0;
  let best = 0;
  for (const day of days) {
    const time = day.getTime();
    run = previous !== undefined && time - previous === DAY_MS ? run + 1 : 1;
    best = Math.max(best, run);
    previous = time;
  }
  // Yesterday's streak is still live until today's opportunity to check in ends.
  const current = previous !== undefined && today.getTime() - previous <= DAY_MS ? run : 0;
  return { current, best };
}

export async function recordLoginDay(userId: string, now = new Date()) {
  const day = new Date(Math.floor(now.getTime() / DAY_MS) * DAY_MS);
  await prisma.loginDay.createMany({ data: [{ userId, day }], skipDuplicates: true });
  const days = await prisma.loginDay.findMany({
    where: { userId, day: { lte: day } },
    orderBy: { day: 'asc' },
    select: { day: true },
  });
  return summarizeStreak(
    days.map((entry) => entry.day),
    day,
  );
}
