"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      navigationType: metric.navigationType
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/telemetry",
        new Blob([body], { type: "application/json" })
      );
      return;
    }

    void fetch("/api/telemetry", {
      method: "POST",
      body,
      headers: { "content-type": "application/json" },
      keepalive: true
    });
  });

  return null;
}
