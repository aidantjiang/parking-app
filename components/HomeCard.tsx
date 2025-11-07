// components/HomeCard.tsx
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  title: string;
  href: string;
  imageSrc?: string;
};

export default function HomeCard({
  title,
  href,
  imageSrc = "/buff.jpeg",
}: Props) {
  return (
    <div className="max-w-md w-full rounded-2xl overflow-hidden shadow-md bg-whit text-black">
      <div className="relative h-48 w-full">
        <Image src={imageSrc} alt={title} fill style={{ objectFit: "cover" }} />
      </div>

      <div className="p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-black">{title}</h3>
        <Link
          href={href}
          className="text-sm underline hover:text-blue-600 transition text-black"
        >
          Open
        </Link>
      </div>
    </div>
  );
}
