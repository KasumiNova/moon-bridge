import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { springs } from "../../theme/motion";

export type SelectMenuOption = {
  value: string;
  label: string;
  className?: string;
  dotClassName?: string;
};

export function SelectMenu({
  options,
  value,
  onChange,
  disabled = false,
  id,
  labelledBy,
  describedBy,
  ariaLabel,
  placeholder
}: {
  options: SelectMenuOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  labelledBy?: string;
  describedBy?: string;
  ariaLabel?: string;
  placeholder?: string;
}) {
  const reactId = useId();
  const baseId = id ?? `select-menu-${reactId}`;
  const listId = `${baseId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const [activeIndex, setActiveIndex] = useState(selectedIndex < 0 ? 0 : selectedIndex);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    setActiveIndex(selectedIndex < 0 ? 0 : selectedIndex);
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, selectedIndex]);

  function close(refocus = true) {
    setOpen(false);
    if (refocus) {
      triggerRef.current?.focus();
    }
  }

  function selectIndex(index: number) {
    const option = options[index];
    if (!option) {
      return;
    }
    onChange(option.value);
    close();
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
      case "Down":
        event.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          setActiveIndex((index) => Math.min(options.length - 1, index + 1));
        }
        break;
      case "ArrowUp":
      case "Up":
        event.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          setActiveIndex((index) => Math.max(0, index - 1));
        }
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
      case "Spacebar":
        event.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          selectIndex(activeIndex);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          close();
        }
        break;
      case "Tab":
        if (open) {
          setOpen(false);
        }
        break;
      default:
        break;
    }
  }

  const activeOptionId = open && options[activeIndex] ? `${baseId}-option-${activeIndex}` : undefined;

  return (
    <div className="select-menu" ref={rootRef} data-open={open ? "true" : undefined}>
      <button
        ref={triggerRef}
        type="button"
        id={baseId}
        className="select-menu__trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={activeOptionId}
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : ariaLabel}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
      >
        {selected?.dotClassName ? (
          <span className={`select-menu__dot ${selected.dotClassName}`} aria-hidden="true" />
        ) : null}
        <span className="select-menu__value" data-placeholder={selected ? undefined : "true"}>
          {selected ? selected.label : placeholder ?? ""}
        </span>
        <span className="material-symbol select-menu__chevron" aria-hidden="true">
          expand_more
        </span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            className="select-menu__list"
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: -6, scaleY: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.96 }}
            transition={springs.spatialFast}
            style={{ transformOrigin: "top" }}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${baseId}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                className={[
                  "select-menu__option",
                  option.className,
                  index === activeIndex ? "select-menu__option--active" : undefined,
                  option.value === value ? "select-menu__option--selected" : undefined
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectIndex(index)}
              >
                {option.dotClassName ? (
                  <span className={`select-menu__dot ${option.dotClassName}`} aria-hidden="true" />
                ) : null}
                <span className="select-menu__option-label">{option.label}</span>
                {option.value === value ? (
                  <span className="material-symbol select-menu__check" aria-hidden="true">
                    check
                  </span>
                ) : null}
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
