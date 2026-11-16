import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Homepage "Meet the team": heading row, then a near-full-bleed group photo
 * (edge to edge on phones, inside the page gutters from md up).
 */
export function MeetTheTeam() {
  return (
    <section aria-labelledby="team-title" className="py-24 md:py-36">
      <Reveal className="container-page grid gap-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="type-label text-grey-600">The team</p>
          <h2 id="team-title" className="type-display mt-3 text-display-xl">
            Meet the
            <br /> team.
          </h2>
        </div>
        <p className="max-w-sm text-lg leading-relaxed text-grey-600 md:col-span-4 md:col-start-9">
          Bucke started as an idea between friends. <span className="whitespace-nowrap">It still is.</span>
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mx-auto mt-14 max-w-[100rem] md:mt-20 md:px-8 xl:px-12">
        {/* 5:4 on phones keeps the group large; the side crop only trims empty lot. */}
        <div className="relative aspect-[5/4] overflow-hidden bg-grey-200 sm:aspect-[16/9]">
          <Image
            src="/team/team-preview.jpg"
            alt="The Bucke team, nine people standing together in front of a corrugated metal warehouse on a sunny day."
            fill
            sizes="(min-width: 100rem) 94rem, (min-width: 80rem) calc(100vw - 6rem), (min-width: 48rem) calc(100vw - 4rem), 100vw"
            className="object-cover"
          />
        </div>
      </Reveal>
    </section>
  );
}
