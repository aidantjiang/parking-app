import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <Link href="/create-new-app">
        <button>create new app</button>
    </Link>
  );
}
