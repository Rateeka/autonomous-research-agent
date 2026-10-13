function LoadingSpinner() {
  return (
    <div className="mt-10 text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>

      <p className="mt-5">
        AI is researching papers...
      </p>
    </div>
  );
}

export default LoadingSpinner;