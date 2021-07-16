// To force the file to be registered as a module, not a script
export {}

declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'

declare global {
  interface Window {
    // solidjs hydration
    _$HYDRATION?: Record<string, any>
  }
}
