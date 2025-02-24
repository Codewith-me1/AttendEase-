"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface Props {
  error: string;
  page: string;
}

const Alert = ({ error, page }: Props) => {
  const [toggle, setToggle] = useState(false); // State to control popup visibility

  useEffect(() => {
    if (error) {
      setToggle(false); // Reset the popup to trigger reanimation
      setTimeout(() => setToggle(true), 50); // Small delay to reset the animation
    }
  }, [error]);

  return (
    <div className="container mx-auto mt-4">
      {toggle && (
        <Card
          className={`fixed top-5 right-5 opacity-100 animate-slide-in-right bg-red-1 bg-[#181023]   00 border text-white-700 px-10 py-4 rounded-md shadow-lg transition-all duration-300 ease-in-out`}
        >
          <h2 className="text-lg font-semibold mb-2">{page} Error</h2>
          <div className="alertMessage text-base">
            <span
              onClick={() => setToggle(false)} // Close the popup
              className="absolute top-2 right-2 cursor-pointer text-xl"
            >
              ×
            </span>
            <strong>Error</strong>
            <span className="ml-2">{error}</span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Alert;
