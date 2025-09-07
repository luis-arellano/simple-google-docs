import Link from 'next/link';

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
        Boilerplate Next.js 15
        </h1>
        <p className="text-lg md:text-xl mb-8 text-foreground/80 max-w-2xl mx-auto leading-relaxed">
          A modern Next.js boilerplate with feature-driven architecture. 
          Includes examples of API integration, state management, and component organization.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/documents"
            className="px-8 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            📝 Collaborative Documents
          </Link>
          <Link
            href="/gists"
            className="px-8 py-3 border border-foreground/20 text-foreground rounded-lg font-medium hover:bg-foreground/5 transition-colors"
          >
            🔍 Explore GitHub Gists
          </Link>
        </div>
        
        {/* Feature showcase */}
        <div className="mt-12 p-6 bg-foreground/5 rounded-lg border border-foreground/10">
          <h3 className="text-lg font-semibold mb-3 text-foreground">
            🚀 Featured Demo: GitHub Gists Search
          </h3>
          <p className="text-sm text-foreground/70 mb-4">
            This boilerplate includes a complete feature implementation showing:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-foreground/60">
            <div>• Feature-driven architecture</div>
            <div>• Zustand state management</div>
            <div>• Custom React hooks</div>
            <div>• API integration patterns</div>
            <div>• TypeScript best practices</div>
            <div>• Responsive UI components</div>
          </div>
        </div>
      </div>
    </section>
  );
}
