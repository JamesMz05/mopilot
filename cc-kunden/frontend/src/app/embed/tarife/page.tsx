'use client'
import { useEffect } from 'react'
import TariffOverview from '@/components/TariffOverview'

function AutoResize() {
  useEffect(() => {
    function postHeight() {
      const height = document.documentElement.scrollHeight
      window.parent.postMessage({ type: 'cc-tarife-resize', height }, '*')
    }

    // Post height on load, resize, and DOM changes
    postHeight()
    window.addEventListener('resize', postHeight)
    const observer = new MutationObserver(postHeight)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true })

    return () => {
      window.removeEventListener('resize', postHeight)
      observer.disconnect()
    }
  }, [])

  return null
}

export default function EmbedTarifePage() {
  return (
    <>
      <AutoResize />
      <TariffOverview />
    </>
  )
}
