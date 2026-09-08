const { PIXI } = window

export const percentBetween = (i, max, percent) => (i + percent*(max-i))/i
export const lerp = (c, t, eq) => c + (t-c)*eq
export const randomIntBetween = (a,b) => Math.ceil(randomBetween(a,b))
export const randomBetween = (a,b) => a + Math.random()*(b-a)

export const chooseRandomColour = (shape, config) => {
	const [r,g,b] = [
		randomIntBetween(config.minR,config.maxR),
		randomIntBetween(config.minG,config.maxG),
		randomIntBetween(config.minB,config.maxB)
	]
	shape.tint = `rgb(${r},${g},${b})`
}

export const drawShapeAndGetBoundary = (shapeType, scale) => {
	// returns the shape, and the top-left, and bottom-right co-ordinates for collisions
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
