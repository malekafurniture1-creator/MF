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
    case "Tables":
      return (
        <svg {...common}>
          <path d="M6 18h52v5H6v-5Zm4 7h4v17h-4V25Zm40 0h4v17h-4V25Z" />
        </svg>
      );
    case "Seating":
      return (
        <svg {...common}>
          <path d="M18 6h4v22h20V6h4v26h4v4H14v-4h4V6Zm-2 32h4v8h-4v-8Zm28 0h4v8h-4v-8Z" />
        </svg>
      );
    case "Mirrors":
      return (
        <svg {...common}>
          <path d="M32 2c10 0 16 8 16 20s-6 22-16 22S16 34 16 22 22 2 32 2Zm0 5c-6.6 0-11 6.2-11 15s4.4 17 11 17 11-8.2 11-17S38.6 7 32 7Z" />
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
