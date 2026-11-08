// Feature card icons drawn on Lucide's 24 px grid with 2 px round strokes.
import type { ReactNode } from 'react';

type Props = { className?: string };

function Svg({ className, children }: Props & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Two bones and a joint. */
export function RigIcon(p: Props) {
  return (
    <Svg {...p}>
      <circle cx="5" cy="19" r="2" />
      <circle cx="12" cy="10" r="2" />
      <circle cx="19" cy="5" r="2" />
      <path d="M6.3 17.5 10.7 11.5" />
      <path d="M13.7 9 17.4 6.2" />
    </Svg>
  );
}

/** A pen nib. */
export function DrawIcon(p: Props) {
  return (
    <Svg {...p}>
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </Svg>
  );
}

/** A letter and a sound wave. */
export function TextSoundIcon(p: Props) {
  return (
    <Svg {...p}>
      <path d="M3 18 7 6l4 12" />
      <path d="M4.5 14h5" />
      <path d="M15 10v4" />
      <path d="M18 7v10" />
      <path d="M21 10v4" />
    </Svg>
  );
}

/** A file with an arrow into it. */
export function ImportIcon(p: Props) {
  return (
    <Svg {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M12 18v-6" />
      <path d="m9 15 3 3 3-3" />
    </Svg>
  );
}

/** Angle brackets. */
export function ScriptIcon(p: Props) {
  return (
    <Svg {...p}>
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
      <path d="m14 4-4 16" />
    </Svg>
  );
}

/** Sparkles. */
export function AssistantIcon(p: Props) {
  return (
    <Svg {...p}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </Svg>
  );
}
