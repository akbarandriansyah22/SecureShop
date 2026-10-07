"use client";

import { useState } from "react";

const TABS = ["Additional Info", "Questions", "Reviews"] as const;

export function DetailTabs() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Additional Info");
  return (
    <section className="mt-12">
      <div className="flex gap-6 border-b border-neutral-200 text-sm">
        {TABS.map((item) => (
          <button key={item} type="button" className={`pb-3 ${tab === item ? "border-b border-neutral-950" : "text-neutral-500"}`} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>
      <p className="py-6 text-sm text-neutral-600">
        {tab === "Additional Info" && "Materials and care notes will appear here when the catalog includes them."}
        {tab === "Questions" && "Ask the shop about fit, delivery, or stock. This preview does not post questions."}
        {tab === "Reviews" && "Reviews are not stored yet. Ratings on the cards are a visual sample."}
      </p>
    </section>
  );
}
