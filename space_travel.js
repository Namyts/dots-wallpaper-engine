window.createSpaceTravelMode = ({ app, config, getAudio }) => {
	const { percentBetween, lerp, randomBetween } = window.helpers

	const farDepth = 1
	const cameraSpeedScale = 0.004
	const perspectiveScale = 0.1
	const cameraLookStrength = 0 // 0.1 is good
	let audio = []
	let averagedAudioMultiplier = 0
	let cameraX = 0
	let cameraY = 0

	app.stage.sortableChildren = true

	if (!window._mouse) {
		window._mouse = { x: app.renderer.width / 2, y: app.renderer.height / 2 }
		window.addEventListener('mousemove', e => {
			window._mouse.x = e.clientX
			window._mouse.y = e.clientY
		})
	}

	const respawnShape = (item, depth = farDepth) => {
		item.depth = depth
		item.worldX = cameraX + randomBetween(-app.renderer.width / 2, app.renderer.width / 2) * depth
		item.worldY = cameraY + randomBetween(-app.renderer.height / 2, app.renderer.height / 2) * depth
		item.shape.zIndex = -item.depth
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

				const targetCameraX = (window._mouse.x / app.renderer.width - 0.5) * app.renderer.width * cameraLookStrength
				const targetCameraY = (window._mouse.y / app.renderer.height - 0.5) * app.renderer.height * cameraLookStrength
				cameraX = lerp(cameraX, targetCameraX, Math.min(1, 0.08 * delta))
				cameraY = lerp(cameraY, targetCameraY, Math.min(1, 0.08 * delta))
			}

			const cameraSpeed = lerp(config.minSpeed, config.maxSpeed, averagedAudioMultiplier) * cameraSpeedScale
			item.depth -= cameraSpeed * delta

			const perspective = 1 / item.depth
			const x = app.renderer.width / 2 + (item.worldX - cameraX) * perspective
			const y = app.renderer.height / 2 + (item.worldY - cameraY) * perspective
			const audioMultiplier = audio[index%audio.length]
			const targetScale = percentBetween(item.initialScale, config.maxBoostScale, audioMultiplier)
			item.audioScale = lerp(item.audioScale, targetScale, config.equalise)
			const nextScale = perspectiveScale * perspective * item.audioScale
			item.shape.scale.set(nextScale)
			const { tl, br } = item

			if (item.depth <= 0.001 ||
				x + (br[0] * nextScale) < 0 || x + (tl[0] * nextScale) > app.renderer.width ||
				y + (br[1] * nextScale) < 0 || y + (tl[1] * nextScale) > app.renderer.height) {
				respawnShape(item)
				item.shape.alpha = 0
				return
			}

			item.shape.x = x
			item.shape.y = y
			item.shape.zIndex = -item.depth
			item.shape.alpha = Math.min(1, (farDepth - item.depth) / 0.2)
		}
	}
}
