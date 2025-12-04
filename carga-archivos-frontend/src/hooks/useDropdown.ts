import { useState, useRef, useCallback, useEffect } from "react";

export function useDropdown() {
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId === null) return;

      const dropdownElement = dropdownRefs.current.get(openDropdownId);
      const buttonElement = buttonRefs.current.get(openDropdownId);

      if (
        dropdownElement &&
        !dropdownElement.contains(event.target as Node) &&
        buttonElement &&
        !buttonElement.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId]);

  // toggle dropdown
  const toggleDropdown = useCallback(
    (userId: number, event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setOpenDropdownId((prevId) => (prevId === userId ? null : userId));
    },
    []
  );

  // cerrar dropdown
  const closeDropdown = useCallback(() => {
    setOpenDropdownId(null);
  }, []);

  // referencias
  const setButtonRef = useCallback(
    (userId: number, el: HTMLButtonElement | null) => {
      if (el) {
        buttonRefs.current.set(userId, el);
      } else {
        buttonRefs.current.delete(userId);
      }
    },
    []
  );

  const setDropdownRef = useCallback(
    (userId: number, el: HTMLDivElement | null) => {
      if (el) {
        dropdownRefs.current.set(userId, el);
      } else {
        dropdownRefs.current.delete(userId);
      }
    },
    []
  );

  return {
    // estado
    openDropdownId,

    // acciones
    toggleDropdown,
    closeDropdown,

    // referencias
    setButtonRef,
    setDropdownRef,
  };
}
