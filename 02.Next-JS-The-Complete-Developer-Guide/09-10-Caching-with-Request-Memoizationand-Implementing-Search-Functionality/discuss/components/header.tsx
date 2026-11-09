import Link from "next/link";
import HeaderAuth from "./headerAuth";
import SearchInput from "./searchInput";

export default async function Header() {
  return (
    <nav className="mb-6 w-full border-b shadow">
      <header className="flex h-16 items-center justify-between gap-4 px-6">
        <Link href="/" className="shrink-0 font-bold">
          Discuss
        </Link>
        <div className="w-full max-w-md">
          <SearchInput />
        </div>
        <div className="shrink-0">
          <HeaderAuth />
        </div>
      </header>
    </nav>
  );
}
