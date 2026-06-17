import { useEffect, useState } from 'react'
import { useTimerStore } from '@/store/timer-store'

export function useZoomSdk() {
  const [isInZoom, setIsInZoom] = useState(false)
  const [sdkError, setSdkError] = useState<string | null>(null)
  const [isHostOrCoHost, setIsHostOrCoHost] = useState(false)
  const [runningContext, setRunningContext] = useState<string | null>(null)

  useEffect(() => {
    let zoomSdkInstance: any = null
    
    // Dynamic import to prevent server-side rendering (SSR) issues
    import('@zoom/appssdk')
      .then(async (module) => {
        const zoomSdk = module.default
        zoomSdkInstance = zoomSdk
        try {
          const configResponse = await zoomSdk.config({
            capabilities: [
              'camera', // Critical for immersive mode
              'shareApp',
              'getMeetingContext',
              'getUserContext',
              'openUrl',
              'sendAppInvitation',
              'getMeetingParticipants',
              'onFeedbackReaction',
              'runRenderingContext',
              'setVideoOverlay',
              'onMeetingConfigChanged',
              'drawParticipant',
              'drawWebView',
              'postMessage',
              'onMessage'
            ],
            version: '0.16'
          })
          
          console.log('Zoom SDK Config:', configResponse)
          setIsInZoom(true)
          setRunningContext(configResponse.runningContext)

          // 1. If in Camera Context, setup layers and listen for state updates from Sidebar
          if (configResponse.runningContext === 'inCamera') {
            console.log('Setting up Camera Layers...')
            try {
              const userContext = await zoomSdk.getUserContext()
              
              // Draw self (zIndex 1)
              await zoomSdk.drawParticipant({
                participantUUID: userContext.participantUUID,
                x: 0, y: 0, width: 100, height: 100, zIndex: 1
              })
              
              // Draw app (zIndex 2)
              await zoomSdk.drawWebView({
                webviewId: 'camera',
                x: 0, y: 0, width: 100, height: 100, zIndex: 2
              })
            } catch (err) {
              console.error('Layer setup failed:', err)
            }

            // Listen for timer updates from the Sidebar instance
            zoomSdk.onMessage((event: any) => {
              const { type, payload } = event.payload
              if (type === 'SYNC_TIMER_STATE') {
                useTimerStore.setState(payload)
              }
            })
          }

          // Check user role
          try {
            const userContext = await zoomSdk.getUserContext()
            const role = userContext.role?.toLowerCase()
            setIsHostOrCoHost(role === 'host' || role === 'cohost')
          } catch (e) {
            console.error('Failed to get user context:', e)
          }

          // Register event listener for raised hands (Sidebar only)
          if (configResponse.runningContext !== 'inCamera') {
            zoomSdk.addEventListener('onFeedbackReaction', async (event: any) => {
              if (event.feedback === 'raiseHand') {
                try {
                  const participantsResp = await zoomSdk.getMeetingParticipants()
                  const participant = participantsResp.participants.find(
                    (p: any) => p.participantUUID === event.participantUUID
                  )
                  if (participant) {
                    useTimerStore.getState().addSpeaker(participant.screenName)
                  }
                } catch (err) {
                  console.error('Hand raise sync failed:', err)
                }
              }
            })
          }
        } catch (err: any) {
          console.log('Zoom Context:', err.message)
          setIsInZoom(false)
          setSdkError(err.message)
        }
      })

  }, [])

  // 2. Broadcast state changes to Camera instance (if timer is running)
  useEffect(() => {
    const unsubscribe = useTimerStore.subscribe((state) => {
      if (isInZoom && runningContext !== 'inCamera' && state.isRunning) {
        import('@zoom/appssdk').then(({ default: zoomSdk }) => {
          zoomSdk.postMessage({
            type: 'SYNC_TIMER_STATE',
            payload: {
              phase: state.phase,
              remainingSeconds: state.remainingSeconds,
              isRunning: state.isRunning,
              isPaused: state.isPaused,
              phase1Seconds: state.phase1Seconds,
              phase2Seconds: state.phase2Seconds,
              currentSpeakerIndex: state.currentSpeakerIndex,
              speakers: state.speakers
            }
          }).catch(() => {}) // Ignore errors if camera view not open
        })
      }
    })
    return () => unsubscribe()
  }, [isInZoom, runningContext])

  const shareApp = async () => {
    const { default: zoomSdk } = await import('@zoom/appssdk')
    await zoomSdk.shareApp()
  }

  const sendInvitation = async () => {
    const { default: zoomSdk } = await import('@zoom/appssdk')
    await zoomSdk.sendAppInvitation()
  }

  const setCameraMode = async () => {
    try {
      const { default: zoomSdk } = await import('@zoom/appssdk')
      // Switch view
      await zoomSdk.runRenderingContext({ view: 'camera' })
      console.log('Camera Mode Requested')
    } catch (err: any) {
      console.error('Camera Mode Error:', err.message)
    }
  }

  return { isInZoom, sdkError, isHostOrCoHost, runningContext, shareApp, sendInvitation, setCameraMode }
}
