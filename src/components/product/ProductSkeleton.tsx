/** Layout-matched placeholder while a product streams in. */
export function ProductSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading product"
      className="container-page grid animate-pulse gap-10 pt-6 pb-20 md:pt-10 lg:grid-cols-12 lg:gap-12 xl:gap-16"
    >
      <div className="aspect-[4/5] bg-grey-200 lg:col-span-7 lg:ml-24 xl:ml-28" />
      <div className="space-y-5 lg:col-span-5">
        <div className="h-4 w-40 bg-grey-200" />
        <div className="h-16 w-4/5 bg-grey-200" />
        <div className="h-6 w-24 bg-grey-200" />
        <div className="h-24 w-full bg-grey-200" />
        <div className="h-12 w-full bg-grey-200" />
      </div>
    </div>
  );
}
