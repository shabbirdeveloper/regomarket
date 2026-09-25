import type { SVGProps } from "react";
import { Camera, Car, Handshake, LandPlot, LayoutGrid, Shirt, Smartphone, Sofa, Tent, Tractor, Wheat } from "lucide-react";
import type { CategoryIconKey } from "@/types";

type IconProps = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };

function base({ size = 24, strokeWidth = 1.5, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...rest,
  };
}

/** Apricot with leaf — drawn on Lucide's 24px grid to sit alongside it */
export function ApricotIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 7.6c-4 0-7 2.8-7 6.6C5 18 8.1 21 12 21s7-3 7-6.8c0-3.8-3-6.6-7-6.6Z" />
      <path d="M12 7.8c-1.4 2.4-1.7 6-.4 9.2" />
      <path d="M12 7.6V5.4" />
      <path d="M12.1 5.5c1-1.7 2.8-2.5 4.9-2.3-.5 2-2.3 3.2-4.9 2.3Z" />
    </svg>
  );
}

/** Mountain goat in profile — drawn on Lucide's 24px grid */
export function GoatIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8.6 9.6c.9-.4 1.9-.6 3-.6h5.2c1.7 0 3 1.2 3 2.8s-1.3 2.8-3 2.8h-6.2c-1.3 0-2.3-.8-2.7-2Z" />
      <path d="M10.5 14.4 10 19.5M12.4 14.6l.3 4.9M16.4 14.6l-.4 4.9M18.3 14.2l.5 5.3" />
      <path d="m19.6 10.2 1-1.8" />
      <path d="M8.6 9.6 6.9 5.8" />
      <path d="M6.9 5.8 3.8 7.9c-.4.3-.4.8-.1 1.2l.3.3c.3.3.8.4 1.2.2l2.5-1.4" />
      <path d="M6.9 5.8C6.7 3.9 8 2.6 10.2 2.8" />
      <path d="m4.3 9.8-.2 1.7" />
    </svg>
  );
}

export function CategoryIcon({ icon, ...props }: IconProps & { icon: CategoryIconKey }) {
  const p = { size: props.size ?? 24, strokeWidth: props.strokeWidth ?? 1.5, className: props.className };
  switch (icon) {
    case "apricot":
      return <ApricotIcon {...p} />;
    case "goat":
      return <GoatIcon {...p} />;
    case "wheat":
      return <Wheat {...p} aria-hidden />;
    case "land":
      return <LandPlot {...p} aria-hidden />;
    case "car":
      return <Car {...p} aria-hidden />;
    case "sofa":
      return <Sofa {...p} aria-hidden />;
    case "phone":
      return <Smartphone {...p} aria-hidden />;
    case "camera":
      return <Camera {...p} aria-hidden />;
    case "tent":
      return <Tent {...p} aria-hidden />;
    case "shirt":
      return <Shirt {...p} aria-hidden />;
    case "tractor":
      return <Tractor {...p} aria-hidden />;
    case "handshake":
      return <Handshake {...p} aria-hidden />;
    case "grid":
    default:
      return <LayoutGrid {...p} aria-hidden />;
  }
}
