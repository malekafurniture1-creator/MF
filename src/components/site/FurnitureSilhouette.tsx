type Props = { name: string; className?: string };

/** Minimal furniture silhouettes drawn as filled shapes (no photo rectangles). */
export function FurnitureSilhouette({ name, className }: Props) {
  const common = {
    className,
    viewBox: "0 0 64 48",
    fill: "currentColor",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  } as const;

  switch (name) {
    case "Wedding Sets":
      return (
        <svg {...common}>
          <path d="M7 20h5v7h33v-7h5v20h-4v-5H11v5H7V20Zm10-9h23a5 5 0 0 1 5 5v2H12v-2a5 5 0 0 1 5-5Z" />
          <path d="M49 7h10v33h-4V12h-6V7ZM52 2l2.5 3L57 2l2 4H50l2-4Z" />
        </svg>
      );
    case "Sofas":
      return (
        <svg {...common}>
          <path d="M8 22a5 5 0 0 1 10 0v4h28v-4a5 5 0 0 1 10 0v12a4 4 0 0 1-4 4h-2v3h-4v-3H16v3h-4v-3h-2a4 4 0 0 1-4-4V22Zm12 4h24v-6a4 4 0 0 0-4-4H24a4 4 0 0 0-4 4v6Z" />
        </svg>
      );
    case "Beds":
      return (
        <svg {...common}>
          <path d="M6 18h6v8h40v-8h6v22h-4v-6H10v6H6V18Zm12 0h28v6H18v-6Zm2-8h24a4 4 0 0 1 4 4v2H16v-2a4 4 0 0 1 4-4Z" />
        </svg>
      );
    case "Bed Set":
      return (
        <svg {...common}>
          <path d="M12 13h40v27h-4v-5H16v5h-4V13Zm5 5v9h30v-9H17Zm-9 9h7v8H5v-5a3 3 0 0 1 3-3Zm41 0h7a3 3 0 0 1 3 3v5H49v-8Z" />
          <path d="M22 7h20v4H22V7Z" />
        </svg>
      );
    case "Dining":
      return (
        <svg {...common}>
          <path d="M4 20h56v4H4v-4Zm6 6h4v14h-4V26Zm40 0h4v14h-4V26ZM18 26h4v8h-4v-8Zm24 0h4v8h-4v-8ZM26 12h4v8h-4v-8Zm8 0h4v8h-4v-8Z" />
        </svg>
      );
    case "Wardrobes":
      return (
        <svg {...common}>
          <path d="M12 4h40v40h-5v-2H17v2h-5V4Zm5 4v30h13V8H17Zm17 0v30h13V8H34Zm-6 13h3v4h-3v-4Zm10 0h3v4h-3v-4Z" />
        </svg>
      );
    case "Centre Tables":
      return (
        <svg {...common}>
          <path d="M6 18h52v5H6v-5Zm4 7h4v17h-4V25Zm40 0h4v17h-4V25Z" />
        </svg>
      );
    case "Mattresses":
      return (
        <svg {...common}>
          <path d="M9 13h42a7 7 0 0 1 7 7v14a7 7 0 0 1-7 7H9a7 7 0 0 1-7-7V20a7 7 0 0 1 7-7Zm0 5a2 2 0 0 0-2 2v5h46v-5a2 2 0 0 0-2-2H9Zm-2 12v4a2 2 0 0 0 2 2h42a2 2 0 0 0 2-2v-4H7Z" />
          <circle cx="16" cy="22" r="1.5" /><circle cx="30" cy="22" r="1.5" /><circle cx="44" cy="22" r="1.5" />
        </svg>
      );
    case "Seating":
      return (
        <svg {...common}>
          <path d="M18 6h4v22h20V6h4v26h4v4H14v-4h4V6Zm-2 32h4v8h-4v-8Zm28 0h4v8h-4v-8Z" />
        </svg>
      );
    case "Dressing Table":
      return (
        <svg {...common}>
          <path d="M32 2c8 0 13 6 13 14s-5 14-13 14-13-6-13-14S24 2 32 2Zm0 4c-5.3 0-9 4.1-9 10s3.7 10 9 10 9-4.1 9-10S37.3 6 32 6Z" />
          <path d="M7 30h50v5H7v-5Zm5 7h5v9h-5v-9Zm35 0h5v9h-5v-9Zm-16-2h4v8h-4v-8Z" />
        </svg>
      );
    case "Showcase":
      return (
        <svg {...common}>
          <path d="M14 3h36v42h-5v-3H19v3h-5V3Zm5 5v13h11V8H19Zm15 0v13h11V8H34ZM19 25v12h11V25H19Zm15 0v12h11V25H34Z" />
          <path d="M27 14h2v3h-2v-3Zm8 0h2v3h-2v-3Zm-8 16h2v3h-2v-3Zm8 0h2v3h-2v-3Z" fill="var(--background, white)" />
        </svg>
      );
    case "Study/Office":
      return (
        <svg {...common}>
          <path d="M4 16h56v5H4v-5Zm4 7h4v19H8V23Zm44 0h4v19h-4V23Zm-34 0h22v6H18v-6Zm0 8h22v4H18v-4Z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M14 2h36v44h-5v-3H19v3h-5V2Zm5 5v31h26V7H19Zm4 4h7v10h-7V11Zm11 0h7v10h-7V11Zm-11 14h7v9h-7v-9Zm11 0h7v9h-7v-9Z" />
        </svg>
      );
  }
}
