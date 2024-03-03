import { onScopeDispose, readonly, ref } from "vue";

/**
 * One clock for the whole app.
 *
 * Every capsule card needs a live countdown. Giving each card its own
 * `setInterval` means N timers, N independent re-render schedules and a leak
 * whenever a card unmounts without clearing up. Instead a single module-level
 * `ref` ticks once a second and every consumer derives from it, so a list of
 * 500 capsules still costs exactly one timer.
 */

const now = ref(Date.now());
let timer = null;
let subscribers = 0;

function start() {
  if (timer !== null) return;
  timer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
}

function stop() {
  if (timer === null) return;
  clearInterval(timer);
  timer = null;
}

/**
 * Subscribe to the shared clock for the lifetime of the calling scope.
 *
 * @returns {{ now: import('vue').Ref<number> }} a read-only epoch-ms ref
 */
export function useNow() {
  subscribers += 1;
  now.value = Date.now();
  start();

  onScopeDispose(() => {
    subscribers -= 1;
    if (subscribers <= 0) {
      subscribers = 0;
      stop();
    }
  });

  return { now: readonly(now) };
}

/** Test helper: tear the timer down and forget subscribers. */
export function __resetClock() {
  subscribers = 0;
  stop();
  now.value = Date.now();
}

export default useNow;
