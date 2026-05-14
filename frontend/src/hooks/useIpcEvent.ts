import { useEffect, useRef } from 'react'

type EventHandle<T extends (...args: any[]) => void> = {
  on:  (fn: T) => void
  off: (fn: T) => void
}

/**
 * 订阅 Electron 主进程推送事件，组件卸载时自动取消。
 * callback 每次渲染可以是新引用，hook 内部用 ref 保持最新版本。
 */
export function useIpcEvent<T extends (...args: any[]) => void>(
  event: EventHandle<T>,
  callback: T,
): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const fn = ((...args: any[]) => callbackRef.current(...args)) as T
    event.on(fn)
    return () => event.off(fn)
  }, [event])
}
