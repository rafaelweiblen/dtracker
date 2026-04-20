import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sw = self as any;

const serwist = new Serwist({
  precacheEntries: sw.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
