import Lottie from "lottie-react";
import { cn } from "@/lib/utils";
import brandAccent from "@/assets/lottie/brand-accent.json";

const presets = {
  brandAccent,
} as const;

export type LottieIconPreset = keyof typeof presets;

type LottieIconProps = {
  preset?: LottieIconPreset;
  animationData?: object;
  className?: string;
  loop?: boolean;
};

export function LottieIcon({
  preset = "brandAccent",
  animationData,
  className,
  loop = true,
}: LottieIconProps) {
  const data = animationData ?? presets[preset];
  return (
    <div className={cn("inline-flex items-center justify-center overflow-hidden", className)} aria-hidden>
      <Lottie animationData={data} loop={loop} className="h-full w-full [&_svg]:h-full [&_svg]:w-full" />
    </div>
  );
}
