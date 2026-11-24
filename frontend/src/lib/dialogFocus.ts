import { type KeyboardEvent, type RefObject, useEffect } from "react";

function focusableElements(panel: HTMLElement) {
  return Array.from(panel.querySelectorAll<HTMLElement>(
    'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]',
  )).filter((element) => element.tabIndex >= 0 && !element.matches(":disabled")
    && !element.closest("[inert], [hidden]") && element.getClientRects().length > 0);
}

export function keepDialogFocus(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab") return;
  const elements = focusableElements(event.currentTarget);
  const first = elements[0];
  const last = elements.at(-1);
  if (!first || !last) {
    event.preventDefault();
    return;
  }
  const active = document.activeElement;
  if (!elements.some((element) => element === active) || active === (event.shiftKey ? first : last)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  }
}

export function useDialogFocus(open: boolean, panel: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open || !panel.current) return;
    const previous = document.activeElement;
    const first = focusableElements(panel.current)[0] ?? panel.current;
    first.focus();
    return () => {
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [open, panel]);
}
