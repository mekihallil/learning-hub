import ReliabilityImg from "@/public/performance.jpg";
import { Hero } from "@/src/app/components/hero";
export default function ReliabilityPage() {
  return (
    <Hero
      imageData={ReliabilityImg}
      imgAlt="welding"
      title="Super high reliability hosting"
    />
  );
}
