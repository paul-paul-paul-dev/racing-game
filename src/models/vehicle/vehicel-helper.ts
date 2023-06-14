export function getGearRatio(gear: number) {
  // https://answers.ea.com/t5/General-Discussion/Gear-ratios-ERS/td-p/11446015
  switch (gear) {
    case 0:
      return 0
    case 1:
      return 2.95
    case 2:
      return 2.47
    case 3:
      return 1.975
    case 4:
      return 1.66
    case 5:
      return 1.4125
    case 6:
      return 1.2525
    case 7:
      return 1.125
    case 8:
      return 0.9925
    case -1:
      return 1 // reverse
    case -2:
      return 3.42 // differential ratio
    default:
      return 1
  }
}

interface TorqueData {
  rpm: number
  torque: number
}

// https://asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html
export function getTorqueAtRPM(rpm: number): number {
  // Define your torque curve data resembling a Formula 1 car
  /*
    { rpm: 1000, torque: 250 },
    { rpm: 3000, torque: 300 },
    { rpm: 5000, torque: 400 },
    { rpm: 7000, torque: 480 },
    { rpm: 9000, torque: 550 },
    { rpm: 10000, torque: 650 },
    { rpm: 11000, torque: 630 },
    { rpm: 13000, torque: 605 },
    { rpm: 14500, torque: 550 },
    { rpm: 15000, torque: 0 }
    */
  const torqueCurve: TorqueData[] = [
    { rpm: 0, torque: 0 },
    { rpm: 1000, torque: 220 },
    { rpm: 3000, torque: 320 },
    { rpm: 5000, torque: 350 },
    { rpm: 7000, torque: 380 },
    { rpm: 9000, torque: 430 },
    { rpm: 10000, torque: 450 },
    { rpm: 11000, torque: 500 },
    { rpm: 12000, torque: 550 },
    { rpm: 13000, torque: 650 },
    { rpm: 14500, torque: 450 },
    { rpm: 14800, torque: 200 },
    { rpm: 15000, torque: 0 },
  ]

  // Interpolate torque at the given RPM
  const rpmValues = torqueCurve.map((data) => data.rpm)
  const torqueValues = torqueCurve.map((data) => data.torque)

  // Perform linear interpolation
  let torque: number
  if (rpm <= rpmValues[0]) {
    torque = torqueValues[0]
  } else if (rpm >= rpmValues[rpmValues.length - 1]) {
    torque = torqueValues[rpmValues.length - 1]
  } else {
    const lowerIndex = rpmValues.findIndex((value) => value >= rpm)
    const upperIndex = lowerIndex - 1
    const lowerRPM = rpmValues[lowerIndex]
    const upperRPM = rpmValues[upperIndex]
    const lowerTorque = torqueValues[lowerIndex]
    const upperTorque = torqueValues[upperIndex]

    const torqueRatio = (rpm - lowerRPM) / (upperRPM - lowerRPM)
    torque = lowerTorque + (upperTorque - lowerTorque) * torqueRatio
  }

  return torque
}

export function calculateDrivingForce(torqueRPM: number, gearRatio: number, differentialRatio = 3.42, transmissionEfficiency: number, wheelRadius: number) {
  return (torqueRPM * gearRatio * differentialRatio * transmissionEfficiency) / wheelRadius
}

export function getRPMBySpeed(wheelRotationRate: number, gearRatio: number, differentialRatio = 3.42) {
  return ((wheelRotationRate * gearRatio * differentialRatio * 60) / 2) * Math.PI
}

export function getEngineBreakForce(rpm: number, gear: number, speed: number): number {
  const maxRpm = 15000
  const maxSpeed = 110
  const maxForce = 7500

  // Check if any of the parameters is 0
  if (rpm === 0 || gear === 0 || speed === 0) {
    return 0
  }

  // Calculate a normalized value for each parameter
  const normalizedRpm = rpm / maxRpm
  const normalizedSpeed = speed / (maxSpeed + 0.3 * maxSpeed)
  const normalizedGear = (8 - gear + 1) / 8 // Assuming gear ranges from 1 to 8

  // Calculate the force based on the normalized parameters
  const force = (maxForce * (normalizedRpm * 2 + normalizedSpeed * 0.5 + normalizedGear)) / 4

  // Return the force, ensuring it falls within the desired range
  return Math.min(Math.max(0, force), maxForce)
}
