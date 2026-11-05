export const buildIncidentTimeline = (events) => {
  if (!Array.isArray(events)) return [];

  return events
    .filter((event) => Number.isFinite(Date.parse(event.timestamp)))
    .sort(
      (a, b) =>
        Date.parse(a.timestamp) - Date.parse(b.timestamp)
    );
};