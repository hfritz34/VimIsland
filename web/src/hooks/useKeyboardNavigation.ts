import { useEffect, useRef, useState } from 'react'

interface NavigableElement {
  id: string
  element: HTMLElement
  priority: number
}

export function useKeyboardNavigation(isActive: boolean = true) {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [navigableElements, setNavigableElements] = useState<NavigableElement[]>([])
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive) return

    const findNavigableElements = () => {
      const container = containerRef.current || document
      const elements: NavigableElement[] = []

      // Find all navigable elements
      const buttons = container.querySelectorAll('button:not([disabled])')
      const links = container.querySelectorAll('a[href]')
      const inputs = container.querySelectorAll('input:not([disabled]), textarea:not([disabled])')
      const selects = container.querySelectorAll('select:not([disabled])')

      // Add buttons with high priority
      buttons.forEach((el, index) => {
        elements.push({
          id: `button-${index}`,
          element: el as HTMLElement,
          priority: 1
        })
      })

      // Add links
      links.forEach((el, index) => {
        elements.push({
          id: `link-${index}`,
          element: el as HTMLElement,
          priority: 2
        })
      })

      // Add inputs
      inputs.forEach((el, index) => {
        elements.push({
          id: `input-${index}`,
          element: el as HTMLElement,
          priority: 3
        })
      })

      // Add selects
      selects.forEach((el, index) => {
        elements.push({
          id: `select-${index}`,
          element: el as HTMLElement,
          priority: 3
        })
      })

      // Sort by priority and position
      elements.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }

        const rectA = a.element.getBoundingClientRect()
        const rectB = b.element.getBoundingClientRect()

        if (Math.abs(rectA.top - rectB.top) > 10) {
          return rectA.top - rectB.top
        }

        return rectA.left - rectB.left
      })

      setNavigableElements(elements)
    }

    findNavigableElements()

    // Re-scan when DOM changes
    const observer = new MutationObserver(findNavigableElements)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [isActive])

  useEffect(() => {
    if (!isActive || navigableElements.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with editor focus
      if (document.activeElement?.classList.contains('monaco-editor')) return

      // Navigation keys
      if (e.key === 'Tab') {
        e.preventDefault()
        const direction = e.shiftKey ? -1 : 1
        const newIndex = (focusedIndex + direction + navigableElements.length) % navigableElements.length
        setFocusedIndex(newIndex)
        navigableElements[newIndex]?.element.focus()
      } else if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault()
        const newIndex = (focusedIndex + 1) % navigableElements.length
        setFocusedIndex(newIndex)
        navigableElements[newIndex]?.element.focus()
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault()
        const newIndex = (focusedIndex - 1 + navigableElements.length) % navigableElements.length
        setFocusedIndex(newIndex)
        navigableElements[newIndex]?.element.focus()
      } else if (e.key === 'Enter' || e.key === ' ') {
        const currentElement = navigableElements[focusedIndex]?.element
        if (currentElement && (e.target === currentElement || !e.target)) {
          e.preventDefault()
          if (currentElement.tagName === 'BUTTON' || currentElement.tagName === 'A') {
            currentElement.click()
          }
        }
      } else if (e.key === 'h' || e.key === 'ArrowLeft') {
        // Navigate to previous element in same row
        e.preventDefault()
        const currentRect = navigableElements[focusedIndex]?.element.getBoundingClientRect()
        if (currentRect) {
          const sameRowElements = navigableElements.filter(el => {
            const rect = el.element.getBoundingClientRect()
            return Math.abs(rect.top - currentRect.top) < 10 && rect.right < currentRect.left
          })
          if (sameRowElements.length > 0) {
            const target = sameRowElements[sameRowElements.length - 1]
            const newIndex = navigableElements.findIndex(el => el.id === target.id)
            setFocusedIndex(newIndex)
            target.element.focus()
          }
        }
      } else if (e.key === 'l' || e.key === 'ArrowRight') {
        // Navigate to next element in same row
        e.preventDefault()
        const currentRect = navigableElements[focusedIndex]?.element.getBoundingClientRect()
        if (currentRect) {
          const sameRowElements = navigableElements.filter(el => {
            const rect = el.element.getBoundingClientRect()
            return Math.abs(rect.top - currentRect.top) < 10 && rect.left > currentRect.right
          })
          if (sameRowElements.length > 0) {
            const target = sameRowElements[0]
            const newIndex = navigableElements.findIndex(el => el.id === target.id)
            setFocusedIndex(newIndex)
            target.element.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, navigableElements, focusedIndex])

  const setContainer = (element: HTMLElement | null) => {
    containerRef.current = element
  }

  const focusFirst = () => {
    if (navigableElements.length > 0) {
      setFocusedIndex(0)
      navigableElements[0].element.focus()
    }
  }

  const focusEditor = () => {
    const editor = document.querySelector('.monaco-editor textarea') as HTMLElement
    if (editor) {
      editor.focus()
    }
  }

  return {
    setContainer,
    focusFirst,
    focusEditor,
    navigableElements,
    focusedIndex
  }
}