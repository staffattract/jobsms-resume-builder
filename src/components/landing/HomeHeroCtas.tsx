"use client";

import Link from "next/link";

type Props = {
  appHref: string;
  btnPrimary: string;
  btnSecondary: string;
};

export function HomeHeroCtas({ appHref, btnPrimary, btnSecondary }: Props) {
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
      <Link
        href={appHref}
        className={btnPrimary}
        onClick={() => console.log("START_BUILDING_CLICK")}
      >
        Start Building Your Resume
      </Link>
      <a
        href="#pricing"
        className={btnSecondary}
        onClick={() => console.log("SEE_PRICING_CLICK")}
      >
        See Pricing
      </a>
    </div>
  );
}
