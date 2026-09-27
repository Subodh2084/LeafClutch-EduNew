import { createElement } from "react";

import { trainingIcons } from "@/components/training/training-icons";
import type { TrainingFeature } from "@/types/training";

export function TrainingFeatureCard({ feature }: { feature: TrainingFeature }) {
  return (
    <div className="h-full rounded-xl border bg-white p-5 shadow-card">
      <span className="flex size-10 items-center justify-center rounded-lg bg-surface-blue">
        {createElement(trainingIcons[feature.icon], {
          "aria-hidden": true,
          className: "size-5 text-navy",
        })}
      </span>
      <h3 className="mt-4 text-base leading-snug font-semibold text-foreground">{feature.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
    </div>
  );
}
