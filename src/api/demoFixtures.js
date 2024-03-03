import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE } from "@/lib/datetime";

/** Serialise a Date the way the Laravel backend does: naive UTC, no offset. */
function asServerDateTime(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export const DEMO_USER = {
  id: 7,
  name: "Dana Ruiz",
  email: "dana@dealersunited.test",
};

/**
 * Seed capsules, positioned relative to "now" so the demo never shows a list of
 * expired fixtures. Deliberately covers all three card states: already opened,
 * unlocked and waiting to be opened, and still counting down.
 *
 * @param {number} [now] epoch ms
 * @returns {Array<{id:number,note:string,scheduled_opening_time:string,is_opened:boolean}>}
 */
export function seedCapsules(now = Date.now()) {
  const at = (offsetMs) => asServerDateTime(new Date(now + offsetMs));

  return [
    {
      id: 101,
      note: "Ship the dealer onboarding rewrite. If this is still open in a year, ask why the scope tripled.",
      scheduled_opening_time: at(-6 * MS_PER_DAY),
      is_opened: true,
    },
    {
      id: 102,
      note: "Reminder to past me: the Q3 inventory sync bug was a timezone bug. It is always a timezone bug.",
      scheduled_opening_time: at(-2 * MS_PER_DAY),
      is_opened: true,
    },
    {
      id: 103,
      note: "Notes from the offsite — read these before the next planning round.",
      scheduled_opening_time: at(-3 * MS_PER_HOUR),
      is_opened: false,
    },
    {
      id: 104,
      note: "One sentence on what you wanted this quarter to be about.",
      scheduled_opening_time: at(-11 * MS_PER_MINUTE),
      is_opened: false,
    },
    {
      id: 105,
      note: "Tomorrow's standup note, written the night before so it is honest.",
      scheduled_opening_time: at(9 * MS_PER_HOUR + 42 * MS_PER_MINUTE),
      is_opened: false,
    },
    {
      id: 106,
      note: "Six-month check-in: did the migration off the legacy feed actually happen?",
      scheduled_opening_time: at(34 * MS_PER_DAY + 5 * MS_PER_HOUR),
      is_opened: false,
    },
    {
      id: 107,
      note: "A letter to whoever is on call the night the new pricing engine goes live.",
      scheduled_opening_time: at(96 * MS_PER_DAY),
      is_opened: false,
    },
  ];
}

export { asServerDateTime };
