import { useStore } from '../store'
import { readableTime } from './LeaderBoard'

export function Checkpoint() {
  const [latestCheckpoint] = useStore(({ latestCheckpoint }) => [latestCheckpoint])

  const isBetter = !latestCheckpoint.bestTime || latestCheckpoint.time < latestCheckpoint.bestTime
  const diff = latestCheckpoint.bestTime ? latestCheckpoint.time - latestCheckpoint.bestTime : latestCheckpoint.time

  const color = isBetter ? 'green' : 'red'
  const split = `${isBetter ? '' : '+'}${readableTime(diff)}`

  return (
    <div className="checkpoint">
      <p>{readableTime(latestCheckpoint.time)}</p>
      <p className={color}>{split}</p>
    </div>
  )
}
