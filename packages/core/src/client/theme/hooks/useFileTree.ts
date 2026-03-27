import { useState } from "react";

export function useFileTree(defaultOpen: boolean = true) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    toggleOpen,
  };
}
