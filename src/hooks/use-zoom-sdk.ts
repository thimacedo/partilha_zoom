import { useEffect, useState } from 'react'

export function useZoomSdk() {
  const [isInZoom, setIsInZoom] = useState(false)
  const [sdkError, setSdkError] = useState<string | null>(null)

  useEffect(() => {
    // Dynamic import to prevent server-side rendering (SSR) issues
    import('@zoom/appssdk')
      .then(async (module) => {
        const zoomSdk = module.default
        try {
          const configResponse = await zoomSdk.config({
            capabilities: [
              'shareApp',
              'getMeetingContext',
              'getUserContext',
              'openUrl',
              'sendAppInvitation'
            ],
            version: '0.16'
          })
          console.log('Zoom Apps SDK initialized successfully:', configResponse)
          setIsInZoom(true)
        } catch (err: any) {
          console.log('Not running inside Zoom client:', err.message)
          setIsInZoom(false)
          setSdkError(err.message)
        }
      })
      .catch((err) => {
        console.error('Failed to load @zoom/appssdk:', err)
      })
  }, [])

  const shareApp = async () => {
    try {
      const { default: zoomSdk } = await import('@zoom/appssdk')
      await zoomSdk.shareApp()
      console.log('App shared successfully to meeting stage')
    } catch (err: any) {
      console.error('Failed to share app:', err.message)
    }
  }

  const sendInvitation = async () => {
    try {
      const { default: zoomSdk } = await import('@zoom/appssdk')
      await zoomSdk.sendAppInvitation()
      console.log('App invitation sent')
    } catch (err: any) {
      console.error('Failed to send app invitation:', err.message)
    }
  }

  return { isInZoom, sdkError, shareApp, sendInvitation }
}
