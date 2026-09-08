import {
	percentBetween,
	lerp,
	randomBetween,
	randomIntBetween,
	chooseRandomColour
} from './helpers.js'

export const createTraditionalMode = ({ app, config, getAudio }) => {
	let wallsHit = 0
	let cornersHit = 0
	let audio = []
	let averagedAudioMultiplier = 0

	return {
		initialiseShape: item => {
			const { shape, initialScale, tl, br } = item
			const initialSpeed = randomBetween(config.minSpeed,config.maxSpeed)
			const initialAngle = randomBetween(0,2*Math.PI)

			item.initialSpeed = initialSpeed
			item.velocity = [Math.cos(initialAngle) * initialSpeed, Math.sin(initialAngle) * initialSpeed]
			shape.x = randomIntBetween(-tl[0], app.renderer.width - br[0])
			shape.y = randomIntBetween(-tl[1], app.renderer.height - br[1])
		},

		updateShape: (item, index, delta) => {
			const { shape, velocity, initialScale, initialSpeed, tl, br } = item
			if (index === 0) {
				audio = getAudio()
				averagedAudioMultiplier = audio
					.slice(1,config.averagedAudioChannelWidth)
					.reduce((total,value)=>total+value,0) / config.averagedAudioChannelWidth
			}

			const audioMultiplier = audio[index%audio.length]
			const targetScale = percentBetween(initialScale, config.maxBoostScale, audioMultiplier)
			const nextScale = Math.min(
				config.maxBoostScale/initialScale,
				lerp(shape.scale.x, targetScale, config.equalise)
			)

			let bounces = 0
			let [dx, dy] = velocity
			if (shape.x + (br[0] * nextScale) >= app.renderer.width || shape.x + (tl[0] * nextScale) <= 0) {
				bounces += 1
				dx *= -1
				item.velocity[0] = dx
			}
			if (shape.y + (br[1] * nextScale) >= app.renderer.height || shape.y + (tl[1] * nextScale) <= 0) {
				bounces += 1
				dy *= -1
				item.velocity[1] = dy
			}
			if (bounces > 0) {
				wallsHit += bounces
				config.colourChangeOnWallHit && chooseRandomColour(shape, config)
				if (bounces === 2) {
					cornersHit += 1
					console.log(cornersHit)
				}
			}

			const currentDx = dx * delta
			const currentDy = dy * delta
			const speedMultiplier = percentBetween(initialSpeed, config.maxBoostSpeed, averagedAudioMultiplier)
			const targetDx = currentDx * speedMultiplier
			const targetDy = currentDy * speedMultiplier

			const x = shape.x + targetDx
			const y = shape.y + targetDy

			shape.x = Math.min(Math.max(x,(-tl[0] * nextScale)),app.renderer.width - (br[0] * nextScale))
			shape.y = Math.min(Math.max(y,(-tl[1] * nextScale)),app.renderer.height - (br[1] * nextScale))
			config.shape !== 'dvd' && shape.scale.set(nextScale)
		}
	}
}
