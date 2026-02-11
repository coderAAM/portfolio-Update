export function ScrollingTicker() {
  const items = [
    "MERN Stack Developer",
    "Full Stack Developer",
    "React Expert",
    "Node.js Developer",
    "WordPress Developer",
    "TypeScript",
    "MongoDB",
    "UI/UX Design",
    "REST APIs",
    "Tailwind CSS",
  ];

  // Double the items for seamless loop
  const tickerItems = [...items, ...items];

  return (
    <div className="w-full overflow-hidden bg-primary/10 border-y border-border/50 py-3">
      <div className="flex animate-scroll-ticker whitespace-nowrap">
        {tickerItems.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-3 mx-4 text-sm font-medium text-muted-foreground"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
