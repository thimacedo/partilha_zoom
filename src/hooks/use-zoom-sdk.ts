import { useEffect, useState } from 'react'
import { useTimerStore } from '@/store/timer-store'

export function useZoomSdk() {
  const [isInZoom, setIsInZoom] = useState(false)
  const [sdkError, setSdkError] = useState<string | null>(null)
  const [isHostOrCoHost, setIsHostOrCoHost] = useState(false)

  useEffect(() => {
    let zoomSdkInstance: any = null
    let feedbackHandler: ((event: any) => void) | null = null

    // Dynamic import to prevent server-side rendering (SSR) issues
    import('@zoom/appssdk')
      .then(async (module) => {
        const zoomSdk = module.default
        zoomSdkInstance = zoomSdk
        try {
          const configResponse = await zoomSdk.config({
            capabilities: [
              'shareApp',
              'getMeetingContext',
              'getUserContext',
              'openUrl',
              'sendAppInvitation',
              'getMeetingParticipants',
              'onFeedbackReaction'
            ],
            version: '0.16'
          })
          console.log('Zoom Apps SDK initialized successfully:', configResponse)
          setIsInZoom(true)

          // Check user role
          try {
            const userContext = await zoomSdk.getUserContext()
            const role = userContext.role?.toLowerCase()
            setIsHostOrCoHost(role === 'host' || role === 'cohost')
          } catch (e) {
            console.error('Failed to get user context:', e)
          }

          // Register event listener for raised hands
          feedbackHandler = async (event: any) => {
            console.log('Feedback reaction event received:', event)
            if (event.feedback === 'raiseHand') {
              try {
                const participantsResp = await zoomSdk.getMeetingParticipants()
                const participant = participantsResp.participants.find(
                  (p: any) => p.participantUUID === event.participantUUID
                )
                if (participant) {
                  const name = participant.screenName
                  const store = useTimerStore.getState()
                  
                  // Check if speaker is already in the queue (case-insensitive)
                  const alreadyInQueue = store.speakers.some(
                    (s) => s.name.trim().toLowerCase() === name.trim().toLowerCase()
                  )
                  if (!alreadyInQueue) {
                    store.addSpeaker(name)
                    console.log(`Automatically added ${name} to queue via Zoom hand raise.`)
                  }
                }
              } catch (err) {
                console.error('Failed to retrieve participant name for hand raise:', err)
              }
            }
          }

          zoomSdk.addEventListener('onFeedbackReaction', feedbackHandler)
        } catch (err: any) {
          console.log('Not running inside Zoom client:', err.message)
          setIsInZoom(false)
          setSdkError(err.message)
        }
      })
      .catch((err) => {
        console.error('Failed to load @zoom/appssdk:', err)
      })

    return () => {
      if (zoomSdkInstance && feedbackHandler) {
        try {
          zoomSdkInstance.removeEventListener('onFeedbackReaction', feedbackHandler)
          console.log('Cleaned up onFeedbackReaction listener')
        } catch (e) {
          console.error('Failed to remove event listener:', e)
        }
      }
    }
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

  return { isInZoom, sdkError, isHostOrCoHost, shareApp, sendInvitation }
}
