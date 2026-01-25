export function UnauthorizedPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-red-600">
        Access Denied
      </h1>
      <p className="mt-2 text-gray-600">
        You don’t have permission to view this page.
      </p>
      <a href="/" className="mt-4 text-blue-600 underline">
        Go to dashboard
      </a>
    </div>
  );
}