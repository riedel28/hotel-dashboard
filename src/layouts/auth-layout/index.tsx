export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:block md:w-1/2 xl:w-2/3"></div>
      <div className="flex w-full flex-col items-center justify-center bg-white p-8 md:w-1/2 xl:w-1/3">
        {children}
      </div>
    </div>
  );
}
