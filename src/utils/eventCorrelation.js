const DEFAULT_WINDOW_MINUTES = 30;

export const correlateEvents = (
  events,
  windowMinutes = DEFAULT_WINDOW_MINUTES
) => {
  if (!Array.isArray(events)) return [];

  const correlations = [];
  const windowMs = windowMinutes * 60 * 1000;

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const first = events[i];
      const second = events[j];

      const firstTime = Date.parse(first.timestamp);
      const secondTime = Date.parse(second.timestamp);

      if (!Number.isFinite(firstTime) || !Number.isFinite(secondTime)) {
        continue;
      }

      const timeDifference = Math.abs(firstTime - secondTime);

      if (timeDifference > windowMs) continue;

      const reasons = [];

      if (first.user && first.user === second.user) {
        reasons.push("Same user account");
      }

      if (first.ip && first.ip === second.ip) {
        reasons.push("Same IP address");
      }

      if (reasons.length > 0) {
        correlations.push({
          eventIds: [first.id, second.id],
          reasons,
          timeDifferenceMinutes: timeDifference / 60000,
        });
      }
    }
  }

  return correlations;
};