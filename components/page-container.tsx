export function PageContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "mx-auto w-full max-w-[min(100%,88rem)] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-14 " +
        className
      }
    >
      {children}
    </div>
  );
}
