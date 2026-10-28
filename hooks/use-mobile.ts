import * as React from "react"

const MOBILE_BREAKPOINT = 768

function subscribeMobile(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

function isMobileSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

export function useIsMobile() {
  const isMobile = React.useSyncExternalStore(
    subscribeMobile,
    isMobileSnapshot,
    () => false
  )
  return isMobile
}
