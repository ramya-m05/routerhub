import { useState, useLayoutEffect } from "react";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    check(); // ✅ run immediately on mount/navigation
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;