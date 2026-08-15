export default function AuthButton({ children }) {
  return (
    <button
      type="submit"
      className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
    >
      {children}
    </button>
  );
}