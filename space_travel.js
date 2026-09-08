window.createSpaceTravelMode = ({ app, randomBetween }) => {
	const farDepth = 1
	const cameraSpeed = 0.001

	const respawnShape = (item, depth = farDepth) => {
		item.depth = depth
		item.worldX = randomBetween(-app.renderer.width / 2, app.renderer.width / 2) * depth
		item.worldY = randomBetween(-app.renderer.height / 2, app.renderer.height / 2) * depth
	}

	return {
		initialiseShape: item => {
			respawnShape(item, randomBetween(0.1,farDepth))
		},

		updateShape: (item, index, delta) => {
			item.depth -= cameraSpeed * delta

			const perspective = 1 / item.depth
			const x = app.renderer.width / 2 + item.worldX * perspective
			const y = app.renderer.height / 2 + item.worldY * perspective
			item.shape.scale.set(0.1 * perspective)
			const radius = Math.max(item.shape.width, item.shape.height) / 2

			if (item.depth <= 0.01 ||
				x + radius < 0 || x - radius > app.renderer.width ||
				y + radius < 0 || y - radius > app.renderer.height) {
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
