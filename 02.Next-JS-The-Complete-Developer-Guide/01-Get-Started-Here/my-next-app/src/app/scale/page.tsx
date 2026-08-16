import ScaleImg from "@/public/performance.jpg";
import { Hero } from "@/src/app/components/hero";
export default function ScalePage() {
  return (
    <Hero
      imageData={ScaleImg}
      imgAlt="steel factory"
      title="Scale your app to infinity"
    />
  );
}
