import React, { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  speed?: number; // ms per character
  className?: string;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 40, className }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!text) return; // guard against undefined/empty text
    
    setDisplayed(""); // reset on text change
    let i = 0;
    
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <>
      <span className={className}>
        {displayed}
        <span className="animate-blink">|</span>
      </span>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </>
  );
};

export default Typewriter;
