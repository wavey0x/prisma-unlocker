import { useEffect, useState } from "react";

export default function FlyingHippo() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Hide after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 left-0 transform -translate-y-1/2 animate-fly-across text-8xl pointer-events-none z-50">
      🦛
    </div>
  );
}
