import { useStore } from '../store'
import { readableTime } from './LeaderBoard'

export function Checkpoint() {
  const [latestCheckpoint] = useStore(({ latestCheckpoint }) => [latestCheckpoint])

  const isBetter = !latestCheckpoint.bestTime || latestCheckpoint.timeDifference < 0

  const color = isBetter ? 'green' : 'red'
  const split = `${isBetter ? '' : '+'}${readableTime(latestCheckpoint.timeDifference)}`

  return (
    <div className="checkpoint">
      <p>{readableTime(latestCheckpoint.time)}</p>
      <p className={color}>{split}</p>
    </div>
  )
}
