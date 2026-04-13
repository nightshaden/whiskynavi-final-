import { type ReactNode, useCallback, useState } from "react";

type FunnelEntry<Steps extends Record<string, unknown>> = {
  [K in keyof Steps]: { step: K; context: Steps[K] };
}[keyof Steps];

type FunnelHistory<Steps extends Record<string, unknown>> = {
  push: <K extends keyof Steps>(step: K, context: Steps[K]) => void;
  back: () => void;
};

type StepRenderers<Steps extends Record<string, unknown>> = {
  [K in keyof Steps]: (props: { context: Steps[K]; history: FunnelHistory<Steps> }) => ReactNode;
};

export function useFunnel<Steps extends Record<string, unknown>>(initial: {
  step: keyof Steps;
  context: Steps[keyof Steps];
}) {
  const [stack, setStack] = useState<FunnelEntry<Steps>[]>([initial as FunnelEntry<Steps>]);

  const current = stack[stack.length - 1];

  const history: FunnelHistory<Steps> = {
    push: useCallback((step, context) => setStack((prev) => [...prev, { step, context } as FunnelEntry<Steps>]), []),
    back: useCallback(() => setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev)), []),
  };

  function Render(renderers: StepRenderers<Steps>) {
    const renderer = renderers[current.step] as (props: {
      context: (typeof current)["context"];
      history: FunnelHistory<Steps>;
    }) => ReactNode;
    return <>{renderer({ context: current.context, history })}</>;
  }

  return { Render, step: current.step, context: current.context, history };
}
