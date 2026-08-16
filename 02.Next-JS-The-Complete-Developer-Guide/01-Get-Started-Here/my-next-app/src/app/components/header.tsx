import Link from "next/link";

export const  Header =()=> {
    return (
      <div>
        <Link href="/">Home</Link>
        <Link href="/performance">Performance</Link>
        <Link href="/reliability">Reliability</Link>
        <Link href="/scale">Scale</Link>
      </div>
    )
}