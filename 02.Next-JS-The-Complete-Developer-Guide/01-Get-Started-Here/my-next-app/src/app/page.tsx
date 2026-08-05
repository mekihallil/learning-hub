import Image from "next/image"
import homeImg from '@/public/home.jpg'
export default function Home() {
  return (
    <div>
      <h1>Home</h1>
     <div className="absolute -z-10 inset-0"> 
       <Image 
        src={homeImg}
        alt="Car factory"
        fill
        style={{objectFit:'cover'}}
      /> 
     </div>
    </div>
  );
}