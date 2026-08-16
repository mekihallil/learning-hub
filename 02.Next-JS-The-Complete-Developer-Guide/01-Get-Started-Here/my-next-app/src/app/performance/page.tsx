import PerformanceImg from "@/public/performance.jpg";
import { Hero } from "@/src/app/components/hero";
export default function PerformancePage() {
  return (
    <Hero
      imageData={PerformanceImg}
      imgAlt="welding"
      title="We serve high performance applications"
    />
  );
}
