var fragmentShader = `
  precision highp float;
  varying vec4 v_color;

  void main() {
      gl_FragColor = v_color;
  }`;

module.exports = createShaders;

function createShaders(pointSize) {

var vertexShader = `
  precision highp float;
  uniform sampler2D u_image;

  uniform vec2 texture_resolution;
  uniform float u_frame;
  uniform float u_max_y_value;

  uniform vec2 mouse_pos;
  uniform vec4 u_sizes;

  // [0] is x coordinate of a particle
  // [1] is y coordinate of a particle
  // [2] is particle lifespan
  // [3] is particle index in the texture.
  attribute vec4 a_particle;

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
    vec2 texture_pos = vec2(
                mod(a_particle[3], texture_resolution.x)/texture_resolution.x,
                floor(a_particle[3] / texture_resolution.x)/(texture_resolution.y)
    );
    v_color = texture2D(u_image, texture_pos);

    vec2 source = vec2(
      2. * texture_pos.x - 1.,
      1. - 2.* texture_pos.y
    ); 

    // we don't want to make small images larger. That's why we pick minimum of 1.
    // float factor = min(1.0, min(u_sizes[3]/u_sizes[1], u_sizes[2]/u_sizes[0]));
    float factor =  min(u_sizes[3]/u_sizes[1], u_sizes[2]/u_sizes[0]);

    source *= factor * u_sizes.xy/u_sizes.zw;

    vec2 target = vec2(
      (2. * a_particle.x  - 1.) * 0.9,
      (2. * a_particle.y/(u_max_y_value) - 1.) * 0.9
    ) * factor * u_sizes.xy/u_sizes.zw; 

    float timeSpan = a_particle.z;
    float t;
    if (u_frame <= timeSpan) t = ease(u_frame/timeSpan);
    else t = 1.;

    if (a_particle.x < 0.) {
      // these particles are filtered out.
      target.x = source.x; //cos(atan(source.y, source.x)) * 2.;
      target.y = source.y; //sin(atan(source.y, source.x)) * 2.;
      v_color.a = 0.; //mix(0.1, 0., t);
//v_color = vec4(1.0, 0., 0., 1.);
    }

    gl_PointSize = max(1., ceil(factor)); // float(${pointSize}); 
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