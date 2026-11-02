/** Layout-matched placeholder while a category streams in (prevents shift). */
export function ShopSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading products" className="animate-pulse">
      <div className="container-page pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="h-4 w-32 bg-grey-200" />
        <div className="mt-6 h-[clamp(3rem,9vw,8.5rem)] w-2/3 max-w-xl bg-grey-200" />
        <div className="mt-10 h-8 border-b border-ink/10" />
      </div>
      <div className="container-page grid grid-cols-2 gap-x-3 gap-y-10 pb-24 md:grid-cols-3 md:gap-x-5 lg:pl-[25%] xl:grid-cols-4 xl:pl-[16.66%]">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] bg-grey-200" />
            <div className="mt-3 h-4 w-3/4 bg-grey-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
