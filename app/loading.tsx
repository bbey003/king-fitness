export default function Loading(): React.ReactElement {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <span
        role="status"
        aria-label="Loading"
        className="inline-block w-10 h-10 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"
      />
    </div>
  );
}
