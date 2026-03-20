export function ScrollingTicker() {
  const items = [
    "MERN Stack Developer", "Full Stack Developer", "React Expert",
    "Node.js Developer", "WordPress Developer", "TypeScript",
    "MongoDB", "UI/UX Design", "REST APIs", "Tailwind CSS",
  ];

  const tickerItems = [...items, ...items];

  return (
    <div className="w-full overflow-hidden glass border-y border-border/30 py-4">
      <div className="flex whitespace-nowrap animate-scroll-ticker">
        {tickerItems.map((item, index) => (
          <span key={index} className="inline-flex items-center gap-3 mx-6 text-sm font-medium text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
