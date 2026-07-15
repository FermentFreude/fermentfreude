/** Parse a YouTube watch, embed, shorts, or youtu.be URL into an 11-char video ID. */
export function parseYoutubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  )
  return match?.[1] ?? null
}

/** Read start offset from `t`, `start`, or `time_continue` query params. */
export function parseYoutubeStartSeconds(url: string): number | undefined {
  const match = url.match(/[?&](?:t|start|time_continue)=(\d+)/)
  if (!match) return undefined
  const seconds = Number(match[1])
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined
}

/** Build a muted autoplay embed URL suitable for a cinematic background loop. */
export function buildYoutubeBackgroundEmbedUrl(
  videoId: string,
  options?: { start?: number; muted?: boolean },
): string {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: options?.muted === false ? '0' : '1',
    playsinline: '1',
    controls: '0',
    modestbranding: '1',
    rel: '0',
    iv_load_policy: '3',
    disablekb: '1',
    fs: '0',
    loop: '1',
    playlist: videoId,
    enablejsapi: '1',
  })

  if (options?.start && options.start > 0) {
    params.set('start', String(options.start))
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`
}
