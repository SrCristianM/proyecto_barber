export default function AuthCard({ children, wide = false }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}