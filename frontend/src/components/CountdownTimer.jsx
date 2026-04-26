import { useState, useEffect } from 'react'
import { parseISO, differenceInSeconds } from 'date-fns'

export default function CountdownTimer({ targetTime, large = false, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = typeof targetTime === 'string' ? parseISO(targetTime) : targetTime
      const diff = differenceInSeconds(target, new Date())
      return diff > 0 ? diff : 0
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)
      
      if (remaining === 0 && onExpire) {
        onExpire()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetTime, onExpire])

  if (timeLeft === null) {
    return <span className="text-gray-400">--:--:--</span>
  }

  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60

  const formatNumber = (num) => num.toString().padStart(2, '0')

  const isUrgent = timeLeft <= 300 // 5 minutes or less
  const isWarning = timeLeft <= 600 && timeLeft > 300 // 5-10 minutes

  let colorClass = 'text-gray-900'
  if (isUrgent) colorClass = 'text-red-600 animate-pulse'
  else if (isWarning) colorClass = 'text-orange-500'

  if (timeLeft === 0) {
    return (
      <span className={`font-mono ${large ? 'text-2xl' : 'text-sm'} text-red-600`}>
        Expired
      </span>
    )
  }

  return (
    <span className={`font-mono ${large ? 'text-2xl font-bold' : 'text-sm'} ${colorClass}`}>
      {hours > 0 && `${formatNumber(hours)}:`}
      {formatNumber(minutes)}:{formatNumber(seconds)}
    </span>
  )
}
