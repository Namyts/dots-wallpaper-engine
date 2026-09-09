window.createSpaceTravelMode = ({ app, config, getAudio }) => {
	const { percentBetween, lerp, randomBetween } = window.helpers

	const farDepth = 1
	let audio = []
	let averagedAudioMultiplier = 0

	const respawnShape = (item, depth = farDepth) => {
		item.depth = depth
		item.worldX = randomBetween(-app.renderer.width / 2, app.renderer.width / 2) * depth
		item.worldY = randomBetween(-app.renderer.height / 2, app.renderer.height / 2) * depth
	}

	return {
		initialiseShape: item => {
			respawnShape(item, randomBetween(0.1,farDepth))
			item.audioScale = 1
		},

		updateShape: (item, index, delta) => {
			if (index === 0) {
				audio = getAudio()
				averagedAudioMultiplier = audio
					.slice(1,config.averagedAudioChannelWidth)
					.reduce((total,value)=>total+value,0) / config.averagedAudioChannelWidth
			}

			const cameraSpeed = lerp(config.minSpeed, config.maxSpeed, averagedAudioMultiplier) * 0.004
			item.depth -= cameraSpeed * delta

			const perspective = 1 / item.depth
			const x = app.renderer.width / 2 + item.worldX * perspective
			const y = app.renderer.height / 2 + item.worldY * perspective
			const audioMultiplier = audio[index%audio.length]
			const targetScale = percentBetween(item.initialScale, config.maxBoostScale, audioMultiplier)
			item.audioScale = lerp(item.audioScale, targetScale, config.equalise)
			const nextScale = 0.1 * perspective * item.audioScale
			item.shape.scale.set(nextScale)
			const { tl, br } = item

			if (item.depth <= 0.01 ||
				x + (br[0] * nextScale) < 0 || x + (tl[0] * nextScale) > app.renderer.width ||
				y + (br[1] * nextScale) < 0 || y + (tl[1] * nextScale) > app.renderer.height) {
				respawnShape(item)
				item.shape.alpha = 0
				return
			}

			item.shape.x = x
			item.shape.y = y
			item.shape.alpha = Math.min(1, (farDepth - item.depth) / 0.2)
		}
	}
}
