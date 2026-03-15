"use client";

import React, { type ReactElement } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface AnimatedListProps {
  className?: string;
  children: React.ReactNode;
}

export const AnimatedList = React.memo(
  ({ className, children }: AnimatedListProps) => {
    const childrenArray = React.Children.toArray(children);

    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <AnimatePresence initial={false}>
          {childrenArray.map((item) => (
            <AnimatedListItem key={(item as ReactElement).key}>
              {item}
            </AnimatedListItem>
          ))}
        </AnimatePresence>
      </div>
    );
  },
);

AnimatedList.displayName = "AnimatedList";

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const animations = {
    initial: { scale: 0.95, opacity: 0, height: 0, originY: 0 },
    animate: { scale: 1, opacity: 1, height: "auto", originY: 0 },
    exit: { scale: 0.95, opacity: 0, height: 0, originY: 0 },
    transition: { type: "spring" as const, stiffness: 350, damping: 25 },
  };

  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  );
}
