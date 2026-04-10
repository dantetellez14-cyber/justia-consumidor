export async function initMSW() {
  if (typeof window === "undefined") return;
  if (process.env.NEXT_PUBLIC_MSW_ENABLED !== "true") return;

  const { worker } = await import("../../e2e/mocks/worker");
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });
}
