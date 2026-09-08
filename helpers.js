window.helpers = {
	percentBetween: (i, max, percent) => (i + percent*(max-i))/i,
	lerp: (c, t, eq) => c + (t-c)*eq,
	randomBetween: (a,b) => a + Math.random()*(b-a),
	randomIntBetween: (a,b) => Math.ceil(window.helpers.randomBetween(a,b)),

	chooseRandomColour: (shape, config) => {
		const { randomIntBetween } = window.helpers
		const [r,g,b] = [
			randomIntBetween(config.minR,config.maxR),
			randomIntBetween(config.minG,config.maxG),
			randomIntBetween(config.minB,config.maxB)
		]
		shape.tint = `rgb(${r},${g},${b})`
	},

	drawShapeAndGetBoundary: (shapeType, scale) => {
		// returns the shape, and the top-left, and bottom-right co-ordinates for collisions
		const { PIXI } = window
		const g = new PIXI.Graphics()
		switch(shapeType){
			case "dvd": { return [ g.svg(window.dvd), [0,0], [500,300] ] }
			case "square": {
				const s = 4*scale
				return [ g.rect(-s,-s,2*s,2*s), [-s,-s], [s,s] ]
			}
			default: {
				const r = 4*scale
				return [ g.circle(0, 0, r), [-r,-r], [r,r] ]
			}
		}
	}
}
