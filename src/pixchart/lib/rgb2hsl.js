var Epsilon = 1e-10; 

module.exports = rgb2hsl;
  
function rgb2hcv(r, g, b) {
  // Based on work by Sam Hocevar and Emil Persson
  var px, py, pz, pw;
  if (g < b) {
    px = b; py = g; pz = -1.0; pw = 2.0/3.0;
  } else {
    px = g; py = b; pz = 0; pw = -1.0/3.0;
  }
  var qx, qy, qz, qw;
  if (r < px) {
    qx = px; qy = py; qz = pw; qw = r;
  } else {
    qx = r; qy = py; qz = pz; qw = px;
  }
  var c = qx - Math.min(qw, qy);
  var h = Math.abs((qw - qy) / (6 * c + Epsilon) + qz);
  return [h, c, qx];
}

function rgb2hsl(r, g, b)  {
  var hcv = rgb2hcv(r, g, b);
  var l = hcv[2] - hcv[1] * 0.5;
  var s = hcv[1] / (1. - Math.abs(l * 2. - 1.) + Epsilon);
  hcv[1] = s;
  hcv[2] = l;
  return hcv;
}