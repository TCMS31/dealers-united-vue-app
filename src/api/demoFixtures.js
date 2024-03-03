import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE } from "@/lib/datetime";

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
  const at = (offsetMs) => new Date(now + offsetMs).toISOString();

  return [
    {
      id: 101,
      note: "Riverside lot, March: 41 used units waiting on reconditioning. If that number is not under 15 by now, the detail bay needs a second shift.",
      scheduled_opening_time: at(-6 * MS_PER_DAY),
      is_opened: true,
    },
    {
      id: 102,
      note: "Reminder: the Q3 inventory feed bug that hid 212 vehicles from the listing sites was a timezone bug. It is always a timezone bug.",
      scheduled_opening_time: at(-2 * MS_PER_DAY),
      is_opened: true,
    },
    {
      id: 103,
      note: "Notes from the general managers' offsite. Read these before the next floor-plan budget round.",
      scheduled_opening_time: at(-3 * MS_PER_HOUR),
      is_opened: false,
    },
    {
      id: 104,
      note: "One sentence on what this quarter was meant to fix in the service-lane upsell.",
      scheduled_opening_time: at(-11 * MS_PER_MINUTE),
      is_opened: false,
    },
    {
      id: 105,
      note: "Saturday sales meeting talking points, written the night before so they are honest.",
      scheduled_opening_time: at(9 * MS_PER_HOUR + 42 * MS_PER_MINUTE),
      is_opened: false,
    },
    {
      id: 106,
      note: "Six-month check-in: did all four rooftops actually move off the legacy DMS export?",
      scheduled_opening_time: at(34 * MS_PER_DAY + 5 * MS_PER_HOUR),
      is_opened: false,
    },
    {
      id: 107,
      note: "A letter to whoever is on call the night the new trade-in pricing engine goes live.",
      scheduled_opening_time: at(96 * MS_PER_DAY),
      is_opened: false,
    },
  ];
}
