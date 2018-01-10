var fragmentShader = `
  precision highp float;
  varying vec4 v_color;

  void main() {
      gl_FragColor = v_color;
  }`;

module.exports = createShaders;

function createShaders() {

var vertexShader = `
  precision highp float;
  uniform sampler2D u_screen;

  uniform vec2 texture_resolution;
  uniform float u_frame;
  uniform vec2 mouse_pos;
  uniform vec4 u_sizes;
  uniform float u_max_y_value;

  // attribute vec2 a_pos;
  attribute float a_index;
  // [0] is x
  attribute vec3 a_particle;

  varying vec2 v_tex_pos;
  varying vec4 v_color;
  
  float ease(float t) {
    return t < 0.5 ? 2. * t * t : -1. + (4. - 2. * t) * t;
  }
  const vec3 rand_constants = vec3(12.9898, 78.233, 4375.85453);
  float rand(const vec2 co) {
      float t = dot(rand_constants.xy, co);
      return fract(sin(t) * (rand_constants.z + t));
  } 
  void main() { 
    gl_PointSize = 2.; 
    vec2 texture_pos = vec2(
                mod(a_index, texture_resolution.x)/texture_resolution.x,
                floor(a_index / texture_resolution.x)/(texture_resolution.y)
    );
    v_color = texture2D(u_screen, texture_pos);
    vec2 source = vec2(
      2. * texture_pos.x - 1.,
      1. - 2.* texture_pos.y
    ); 
    float sx = u_sizes[2]/u_sizes[0];
    float sy = u_sizes[3]/u_sizes[1];
    source.x *= u_sizes[0] * min(sx, sy) / u_sizes[2];
    source.y *= u_sizes[1] * min(sx, sy) / u_sizes[3];

    vec2 target = vec2(
      (2.* (a_particle.x/texture_resolution.x) - 1.) * 0.9, 
      (1.75* a_particle.y/u_max_y_value - .8)*0.9
    ); 

    if (a_particle.x < 0.) {
      target.x = cos(atan(source.y, source.x)) * 2.;
      target.y = sin(atan(source.y, source.x)) * 2.;
    }

    float timeSpan = a_particle.z;
    float t;
    if (u_frame <= timeSpan) t = ease(u_frame/timeSpan);
    else t = 1.;
    float tmin = 1. - t;
    vec2 dest = tmin * source + t * target;
  // vec2 dest = tmin * tmin * source + 2. * tmin * vec2(0.) * t + t * t * target;
    //vec2 dest = tmin * tmin * tmin * source + 3. * tmin * tmin * vec2(0., 0.1) * t + 3. * tmin * t * t * target/2. + target * t * t * t; 
    gl_Position = vec4(dest, 0, 1);
  }`

  return {
    vertexShader,
    fragmentShader
  }
}