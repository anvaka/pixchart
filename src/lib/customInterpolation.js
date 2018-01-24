module.exports = {
  bezierNoise() {
    return `
  vec2 dest = u_frame[3] == 1. ? 
    bezier(target, target, vec2(snoise(source * h[0]), snoise(source * h[1])), source, tmin) :
    bezier(source, vec2( snoise(source * h[0]), snoise(source * h[1])), target, target, tmin);
` },

 voigram() {
    return `` }
}