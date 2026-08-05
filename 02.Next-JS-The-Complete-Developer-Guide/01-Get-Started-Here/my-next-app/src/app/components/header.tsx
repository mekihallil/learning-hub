import Link from "next/link";

export default function header() {
    return (
      <div>
        <Link href="/">Home</Link>
        <Link href="/performance">Performance</Link>
        <Link href="/reliability">Reliability</Link>
        <Link href="/scale">Scale</Link>
      </div>
    )
}