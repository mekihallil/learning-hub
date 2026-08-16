import homeImg from "@/public/home.jpg";
import { Hero } from "./components/hero";
export default function Home() {
  return (
    <Hero
      imageData={homeImg}
      imgAlt="Car Factory"
      title="Professional Cloud Hosting"
    />
  );
}
