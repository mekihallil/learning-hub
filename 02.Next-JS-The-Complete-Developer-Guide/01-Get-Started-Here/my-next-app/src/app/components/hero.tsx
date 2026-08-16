import Image, { StaticImageData } from "next/image";

interface heroProps {
  imageData: StaticImageData;
  imgAlt: string;
  title: string;
}
export const Hero = ({ imageData, imgAlt, title }: heroProps) => {
  return (
    <div className="relative h-screen">
      <section className="absolute -z-10 inset-0">
        <Image
          src={imageData}
          alt={imgAlt}
          fill
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-slate-900" />
      </section>

      <div className="pt-48 flex justify-center items-center">
        <h1 className="text-white text-6xl">{title}</h1>
      </div>
    </div>
  );
};
