"use client"

import { Maximize2, Minimize2 } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

interface FullscreenButtonProps {
  /** Ref to the element to present fullscreen. */
  targetRef: React.RefObject<HTMLElement | null>
}

/** Toggles the browser Fullscreen API on the referenced element. */
export function FullscreenButton({ targetRef }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  async function toggle() {
    const node = targetRef.current
    if (!node) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await node.requestFullscreen()
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle}>
      {isFullscreen ? <Minimize2 className="mr-1 h-4 w-4" /> : <Maximize2 className="mr-1 h-4 w-4" />}
      {isFullscreen ? "Exit" : "Fullscreen"}
    </Button>
  )
}
