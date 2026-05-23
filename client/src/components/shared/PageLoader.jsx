// Full-page loading state — shown while fetchCurrentUser runs on app mount
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-white">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
  </div>
);

export default PageLoader;
