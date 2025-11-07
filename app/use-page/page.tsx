import Image from "next/image";
import Link from 'next/link';

export default function usePage() {
  return (
    <Link href="/create-new-app">
        <button>use page</button>
    </Link>
  );
}
