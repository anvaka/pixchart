webpackJsonp([1],{"14gb":function(e,t,n){var r=n("puH/");e.exports=r({})},"794Q":function(e,t,n){var r=n("Tz9f")(42),i=n("n3s9"),a=12;e.exports=function(e,t){if(!t)throw new Error("Options required");var n,{onProgress:o,ignoredBuckets:s}=t,{getValue:c,normalizeV:u,name:l}=function(e){"string"==typeof e&&(e=i[e]);if("function"==typeof e)return{name:"custom",normalizeV:!1,getValue:e};if(e&&"function"==typeof e.getValue)return{normalizeV:e.normalize,getValue:e.getValue,name:e.name};throw new Error("Unknown group by function")}(t.colorGroupBy),m=t.maxFrameSpan||a,d=0;console.time("init stats");var f=document.createElement("canvas"),g=f.width=e.width,v=f.height=e.height,p=g*v,x=t.bucketCount||42,h=Math.ceil(g/x),b=0,y=0,w=Number.POSITIVE_INFINITY,_=Number.NEGATIVE_INFINITY,T=f.getContext("2d");T.drawImage(e,0,0,e.width,e.height);var E=T.getImageData(0,0,g,v).data,S=0,z=Number.POSITIVE_INFINITY,A=Number.NEGATIVE_INFINITY,P=new Float32Array(4*p),I=new Uint32Array(x);if(console.timeEnd("init stats"),console.time("initParticles"),u){console.time("minmax");for(var C=4*p,N=0;N<C;N+=4){var L=E[N+0],F=E[N+1],k=E[N+2],B=c(L,F,k);B<w&&(w=B),B>_&&(_=B)}console.timeEnd("minmax")}else w=0,_=1;return R(),new Promise(e=>{n=e});function R(){t.isCancelled||((d+=1)%10==0&&o(S/4),setTimeout(D,0))}function D(){for(var e,i=performance.now(),a=4*p,o=t.stochastic;S<a;){var u=a-S-4,g=E[u+0],v=E[u+1],T=E[u+2],C=(c(g,v,T)-w)/(_-w),N=Math.round(C*x);N===x&&(N-=1),e=I[N]+=1,e-=1;var L=r.gaussian();P[S+0]=N/x+e%h/(x*h),P[S+1]=Math.floor(e/h),P[S+2]=o?L:0,P[S+3]=u/4,L<z&&(z=L),L>A&&(A=L);var F=P[S+1];if(s&&s.has(N)?P[S]=-1:F>b&&(b=F),F>y&&(y=F),S+=4,performance.now()-i>m)return void R()}console.timeEnd("initParticles"),console.log("initialized in "+d+" intervals; Max Value:",b),console.log("Color range: ",w,_),console.log("Lifespan range: ",z,A),n({buckets:I,groupByFunctionName:l,minFrameSpan:z,maxFrameSpan:A,minVValue:w,maxVValue:_,particleAttributes:P,canvas:f,maxYValue:b,nonFilteredMaxYValue:y,bucketWidth:h,ignoredBuckets:s})}}},QmSG:function(e,t){e.exports={sidebarWidth:400,sidebarHeight:42,isSmallScreen:()=>window.innerWidth<=800}},TrHg:function(e,t){e.exports=function(e){return`\nprecision highp float;\nuniform sampler2D u_image;\n\n// Everything we need to know about frame\n// [0] - currentFrameNumber\n// [1] - minFrame value\n// [2] - maxFrame value\nuniform vec4 u_frame;\nuniform float u_max_y_value;\nuniform vec2 mouse_pos;\nuniform vec4 u_sizes;\n\n// [0] is x coordinate of a particle\n// [1] is y coordinate of a particle\n// [2] is particle lifespan\n// [3] is particle index in the texture.\nattribute vec4 a_particle;\n\nvarying vec4 v_color;\n\nfloat ease(float t) {\n  return t < 0.5 ? 2. * t * t : -1. + (4. - 2. * t) * t;\n}\n\nvec2 bezier(vec2 p0, vec2 p1, vec2 p2, vec2 p3, float t) {\n  float one_minus_t = 1. - t;\n\n  return one_minus_t * one_minus_t * one_minus_t * p0 + \n    3. * one_minus_t * one_minus_t * t * p1 + \n    3. * one_minus_t * t * t * p2 +\n    t * t * t * p3;\n}\n\nfloat bease(float t, vec2 p1, vec2 p2) {\n  vec2 p0 = vec2(0.);\n  vec2 p3 = vec2(1.);\n  vec2 res = bezier(p0, p1, p2, p3, t);\n  return res.y;\n}\n\nconst vec3 rand_constants = vec3(12.9898, 78.233, 4375.85453);\n\nfloat rand(const vec2 co) {\n  float t = dot(rand_constants.xy, co);\n  return fract(sin(t) * (rand_constants.z + t));\n} \n\nvec3 rgb2hsv(vec3 c) {\n    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n\n    float d = q.x - min(q.w, q.y);\n    float e = 1.0e-10;\n    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n}\n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec2 mod289(vec2 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec3 permute(vec3 x) {\n  return mod289(((x*34.0)+1.0)*x);\n}\n\nfloat snoise(vec2 v) {\n  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0\n                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)\n                     -0.577350269189626,  // -1.0 + 2.0 * C.x\n                      0.024390243902439); // 1.0 / 41.0\n// First corner\n  vec2 i  = floor(v + dot(v, C.yy));\n  vec2 x0 = v -   i + dot(i, C.xx);\n// Other corners\n  vec2 i1;\n  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\n  //i1.y = 1.0 - i1.x;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  // x0 = x0 - 0.0 + 0.0 * C.xx ;\n  // x1 = x0 - i1 + 1.0 * C.xx ;\n  // x2 = x0 - 1.0 + 2.0 * C.xx ;\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n// Permutations\n  i = mod289(i); // Avoid truncation effects in permutation\n  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))\n\t\t+ i.x + vec3(0.0, i1.x, 1.0 ));\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n  m = m*m ;\n  m = m*m ;\n// Gradients: 41 points uniformly over a line, mapped onto a diamond.\n// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n// Normalise gradients implicitly by scaling m\n// Approximation of: m *= inversesqrt( a0*a0 + h*h );\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n// Compute final noise value at P\n  vec3 g;\n  g.x  = a0.x  * x0.x  + h.x  * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\nvec2 cmpxmul(in vec2 a, in vec2 b) {\n\treturn vec2(a.x * b.x - a.y * b.y, a.y * b.x + a.x * b.y);\n}\n\nvoid main() { \n  vec2 texture_pos = vec2(\n    fract(a_particle[3] / u_sizes.x) + 0.5/u_sizes.x,\n    floor(a_particle[3] / u_sizes.x)/(u_sizes.y) + 0.5/u_sizes.y\n  );\n\n  v_color = texture2D(u_image, texture_pos);\n  if (texture_pos.x >= 1.0 || texture_pos.y >= 1.) {\n    // This point is beyond texture edge. ignore.\n    v_color.a = 0.;\n  }\n\n  float factor = min(u_sizes[3]/u_sizes[1], u_sizes[2]/u_sizes[0]);\n  vec2 source = vec2(\n    (2. * (texture_pos.x) - 1.),\n    1. - 2.* texture_pos.y\n  ) * factor * u_sizes.xy/u_sizes.zw;\n\n  vec2 target = vec2(\n    (2. * (a_particle.x)   - 1.) * 0.9,\n    (2. * a_particle.y/(u_max_y_value) - 1.) * 0.9\n  ) * factor * u_sizes.xy/u_sizes.zw; \n  \n\n// This particle is allowed to live timeSpan steps, while current frame (u_frame[0]) is\n// advancing. Their time zero is counted at u_frame[1].\n  float timeSpan = a_particle.z;\n  float t0 = clamp((u_frame[0] - u_frame[1])/(timeSpan - u_frame[1]), 0., 1.);\n  float t = bease(t0, vec2(0., 0.19), vec2(0.61, 1)); // easeInOutCubic\n  //float t = ease(t0);\n\n  if (a_particle.x < 0.) {\n    // these particles are filtered out.\n    // target.x = 0.; //source.x; //cos(atan(source.y, source.x)) * 2.;\n    // target.y = 0.; //source.y; //sin(atan(source.y, source.x)) * 2.;\n    v_color.a = 0.; //mix(0.1, 0., t);\n  }\n\n  // // This would give 3d\n  vec3 h = rgb2hsv(v_color.rgb);\n  // float z = mix(0., h[0], t);\n  // float zCam = 2.;\n  // target.x = -target.x/(z - zCam);\n  // target.y = -target.y/(z - zCam);\n\n  // we want to have fast start/slow cool down on each animation phase\n  float tmin = 1. - t;\n  ${(e||function(){return"\nvec2 dest = u_frame[3] == 2. ? tmin * target + t * source : tmin * source + t * target;\n  "})()}\n  // vec2 dest = tmin * tmin * source + 2. * tmin * arrival0 * t + t * t * target;\n  //vec2 dest = tmin * tmin * tmin * source + 3. * tmin * tmin * vec2(0., 0.1) * t + 3. * tmin * t * t * target/2. + target * t * t * t; \n  //v_color.a = mix(1.0, 0.8, t);\n  //gl_Position = vec4(dest, 0, 1);\n  //gl_Position = vec4(dest, 0, 1);\n  gl_Position = vec4(dest, 0, 1);\n  gl_PointSize = max(1., ceil(factor));//= mix(srcSize, destSize, t);\n}\n`}},TzId:function(e,t,n){var r=n("3zJd"),i=n("p3CA"),a=n("QmSG"),o=n("uWeX"),s=n("vm2c"),c=n("yZJi"),u=n("nFhm"),l=n("hGrZ"),m=n("14gb"),d=4,f=510,g=1e3,v=r({d:d},{useSearch:!0});function p(e){return 60*e}e.exports=function(e){var t,n,r=!1,x=document.getElementById("progress"),h=[],b=0,y=v.get("link");y&&(h=[y],n=setTimeout(X,0));window.addEventListener("paste",L,!1),window.addEventListener("resize",V),e.addEventListener("click",R),document.body.addEventListener("keydown",B),m.on("theme-changed",U);var w=s(document.body,F),_=function(e){var t=new Set;if(!e)return t;if("number"==typeof e)return t.add(e),t;return e.split("_").forEach(e=>{var n=Number.parseInt(e,10);Number.isNaN(n)||t.add(n)}),t}(v.get("ignore")),T=_.size>0,E=new Set(["linear-constant","linear-stochastic","bezier-constant","bezier-stochastic"]),S={image:y,sidebarOpen:!a.isSmallScreen(),duration:d,bucketCount:(A=v.get("bc"),P=Number.parseInt(A,10),Number.isNaN(P)||P<1?f:P),maxPixels:u(),currentColorGroupBy:C(v.get("groupBy")),initialImageState:(z=v.get("initial"),"collapsed"===z?z:"expanded"),animationType:I(v.get("atype")),paused:!1,isFirstRun:0===h.length,isLocalFiles:!1,updateSize:V,dispose:function(){n&&(clearTimeout(n),n=0);window.removeEventListener("resize",V),window.removeEventListener("paste",L,!1),e.removeEventListener("click",R),document.body.removeEventListener("keydown",B),m.off("theme-changed",U),w.dispose(),t.dispose(),t=null},setImages:q,setAnimationDuration:W,setAnimationType:function(e){if(I(e)!==e)throw new Error("unknown animation "+e);if(v.set("atype",e),S.animationType=e,!t)return;N()},setBucketCount:function(e){var n=Number.parseInt(e,10);if(Number.isNaN(n)||n<1)return;v.set("bc",n),S.bucketCount=n,t&&N()},setMaxPixels:function(e){var n=Number.parseInt(e,10);if(Number.isNaN(n))return;S.maxPixels=n,t&&(x.style.innerText="Updating particles...",x.style.opacity="1",t.setMaxPixels(n))},setColorGroupBy:function(e){var t=C(e);S.currentColorGroupBy=t,v.set("groupBy",S.currentColorGroupBy),N()},setInitialState:function(e){S.initialImageState=e,v.set("initial",e),T=!0,N()},ignoreBucket:function(e){e||M(!0);t&&(!function(e){if(!e)return;Array.isArray(e)||(e=[e]);e.forEach(e=>{_.has(e.bucketNumber)?_.delete(e.bucketNumber):_.add(e.bucketNumber)})}(e),T=!0,N());v.set("ignore",Array.from(_).join("_"))},getStatistics:function(){var e=t&&t.getParticles();if(e)return o(e)}};var z;var A,P;return W(v.get("d")),void(window.sceneState=S);function I(e){return E.has(e)?e:"linear-stochastic"}function C(e){return e||"hsl.l"}function N(){h.length&&((b-=1)<0&&(b=h.length-1),X(!0))}function L(e){for(var t=e.clipboardData.items,n=[],r=[],i=0;i<t.length;++i){var a=t[i];"file"===a.kind?n.push(a.getAsFile()):"string"===a.kind&&"text/plain"===a.type&&r.push(a)}n.length>0&&e.preventDefault(),0===n.length&&1===r.length&&r[0].getAsString(e=>{e&&e.match(/^http?s:\//)&&q([e])}),F(n)}function F(e){var t=e.filter(k);t.length>0&&q(t)}function k(e){return e&&e.type&&0===e.type.indexOf("image/")}function B(e){e.target===document.body&&(32===e.which?D({clientX:window.innerWidth/2,clientY:window.innerHeight/2}):39===e.which?X(!0):37===e.which&&function(e){if(0===h.length)return;(b-=2)<0&&(b=h.length-1);X(e)}(!0))}function R(e){t&&(e.preventDefault(),e.stopPropagation(),D(e))}function D(e){S.paused=t.togglePaused(),S.paused&&clearTimeout(n),G({step:S.paused?"paused":"unpaused"}),m.fire("pause-changed",S.paused,{x:e.clientX,y:e.clientY})}function V(){if(t){var e=!S.sidebarOpen||a.isSmallScreen()?0:a.sidebarWidth,n=a.isSmallScreen()?a.sidebarHeight:0;t.setSceneSize(window.innerWidth-e,window.innerHeight-n)}}function U(e){v.set("theme",e)}function G(e){"pixels"===e.step?x.innerText="Processed "+c(e.current)+" pixels out of "+c(e.total):"done"===e.step?(x.style.opacity="0",e.imageObject.isUrl?(v.set("link",e.imageObject.name),S.image=e.imageObject.name,S.isLocalFiles=!1):(v.set("link",""),S.image="",S.isLocalFiles=!0),m.fire("image-loaded")):"error"===e.step?(x.classList.add("error"),r=!0,x.innerHTML='Could not load image :(. <br /> Try uploading it to <a href="https://imgur.com" target="_blank">imgur.com</a>?',h.length>1&&(n=setTimeout(X,500))):"paused"===e.step?(x.style.opacity="1",x.innerHTML="Paused. Click anywhere to resume",document.body.classList.add("paused")):"unpaused"===e.step&&(x.style.opacity="0",document.body.classList.remove("paused")),r&&"error"!==e.step&&(r=!1,x.classList.remove("error"))}function M(e){_.clear(),e||v.set("ignore",Array.from(_).join("_"))}function O(r){x.innerText="Loading image...",x.style.opacity="1",T||M(),T=!1;var a={canvas:e,colorGroupBy:S.currentColorGroupBy,scaleImage:!0,bucketCount:S.bucketCount,ignoredBuckets:_,stochastic:S.animationType.indexOf("stochastic")>-1,collapsed:"collapsed"===S.initialImageState,maxPixels:S.maxPixels,framesCount:p(S.duration)};S.animationType.indexOf("bezier")>-1?a.interpolate=l.bezierNoise:S.animationType.indexOf("voigram")>-1&&(a.interpolate=l.voigram),(t=i(r,a)).on("cycle-complete",()=>{n=setTimeout(X,g)}),t.on("loading-progress",G),t.on("frame",H)}function H(e){m.fire("animation-frame",e)}function q(e){S.isFirstRun=!1,0!==e.length&&(h=e,b=0,X())}function W(e){var n=Number.parseFloat(e);Number.isNaN(n)||(v.set("d",n),S.duration=n,t&&t.setFramesCount(p(n)))}function X(e){n&&(clearTimeout(n),n=0);var r=h[b];(b+=1)>=h.length&&(b=0),function(e,r){if(t&&e===t.imageLink&&!r)return void t.restartCycle();t?(n&&(clearTimeout(n),n=0),m.fire("image-unloaded",t),t.dispose(),n=setTimeout(()=>{O(e),n=0},250)):O(e)}(r,e)}}},dM2D:function(e,t,n){var r=n("TrHg"),i="\n  precision highp float;\n  varying vec4 v_color;\n\n  void main() {\n      gl_FragColor = v_color;\n  }";e.exports=function(e){return{fragmentShader:i,vertexShader:r(e)}}},hGrZ:function(e,t){e.exports={bezierNoise:()=>"\n  vec2 dest = u_frame[3] == 1. ? \n    bezier(target, target, vec2(snoise(source * h[0]), snoise(source * h[1])), source, tmin) :\n    bezier(source, vec2( snoise(source * h[0]), snoise(source * h[1])), target, target, tmin);\n",voigram:()=>""}},n3s9:function(e,t,n){var{rgbToHsl:r}=n("nvID");e.exports={"rgb.r":{getValue:(e,t,n)=>e/255,name:"Red"},"rgb.g":{getValue:(e,t,n)=>t/255,name:"Green"},"rgb.b":{getValue:(e,t,n)=>n/255,name:"Blue"},"hsl.h":{getValue:(e,t,n)=>r(e,t,n,0),name:"Hue"},"hsl.s":{getValue:(e,t,n)=>r(e,t,n,1),name:"Saturation"},"hsl.l":{getValue:(e,t,n)=>r(e,t,n,2),name:"Lightness"},"avg.rgb":{getValue:(e,t,n)=>(e/255+t/255+n/255)/3,name:"Average color"},"harmonic.rgb":{getValue:(e,t,n)=>3/(1/e+1/t+1/n),normalize:!0,name:"Harmonic average"}}},nFhm:function(e,t){e.exports=function(){var e=Math.floor(window.devicePixelRatio),t=window.innerWidth*window.innerHeight;1===e&&t>409600&&(e=2);return Math.round(Math.min(t,409600)*e*1.1)}},nvID:function(e,t){e.exports={rgbToHsl:function(e,t,n,r){e/=255,t/=255,n/=255;var i,a,o=Math.max(e,t,n),s=Math.min(e,t,n),c=(o+s)/2;if(o==s)i=a=0;else{var u=o-s;switch(a=c>.5?u/(2-o-s):u/(o+s),o){case e:i=(t-n)/u+(t<n?6:0);break;case t:i=(n-e)/u+2;break;case n:i=(e-t)/u+4}i/=6}if(0===r)return i;if(1===r)return a;if(2===r)return c}}},p3CA:function(e,t,n){var r=n("puH/"),i=n("dM2D"),a=n("zLWS"),o=n("xu59"),s=n("794Q"),c=1,u=2;e.exports=function(e,t){var n="string"==typeof e?(d=e,{name:d,isUrl:!0,getUrl:()=>d}):(m=e,{name:m.name,getUrl:()=>window.URL.createObjectURL(m)}),l=(t=t||{}).canvas;var m;var d;if(!l)throw new Error("Canvas is required");var f=l.getContext("webgl")||l.getContext("experimental-webgl");if(!f)throw new Error("WebGL is not available");var g,v,p,x,h,b,y,w,_,T,E=t.collapsed?u:c,S=E,z=!1,A=!1,P=0,I=t.framesCount||120,C=S===c?0:I,N={isCancelled:!1,ignoredBuckets:t.ignoredBuckets||null,framesCount:I,onProgress:function(e){L.current=e,W()},colorGroupBy:t.colorGroupBy,bucketCount:t.bucketCount,stochastic:void 0===t.stochastic||t.stochastic},L={imageObject:n,total:0,current:0,step:"image"},F=!1,k=l.clientWidth,B=l.clientHeight,R=void 0===t.scaleImage||t.scaleImage,D=t.maxPixels,V="number"==typeof t.startDelay?t.startDelay:2e3,U="number"==typeof t.reverseDelay?t.reverseDelay:1500,G=i(t.interpolate),M=a.createProgram(f,G.vertexShader,G.fragmentShader),O=r({dispose:function(){cancelAnimationFrame(g),clearTimeout(v),Z(),M&&M.unload();l.style.opacity=0,N.isCancelled=!0,g=0,v=0,z=!0},imageLink:e,getParticles:function(){return T},ignoreBucketSet:function(e){N.ignoredBuckets=e,H().then(q).then(X)},restartCycle:Q,setSceneSize:function(e,t){l.width=e,l.height=t,k=e,B=t,requestAnimationFrame(()=>{F=!0,f.viewport(0,0,k,B),j()})},setFramesCount:function(e){I=Math.max(e,1),y=(b-h)/I},setMaxPixels:function(e){D=e,H().then(q).then(e=>X(e,!0))},colorGroupBy:function(e){N.colorGroupBy=e,H().then(q).then(X)},togglePaused:function(){if(!w)return;A?g=requestAnimationFrame(Y):(cancelAnimationFrame(g),g=0,clearTimeout(v),v=0,P=new Date);return A=!A}});return setTimeout(function(){H().then(q).then(X).then(Q).catch(e=>{console.error("error",e),L.step="error",W()})},0),O;function H(){return o(n,{scaleImage:R,maxPixels:D})}function q(e){return L.total=e.width*e.height,L.step="pixels",T=null,W(),s(e,N).then(t=>(T=t,L.step="done",W(),{texture:a.createTexture(f,t.canvas),particles:t,width:e.width,height:e.height}))}function W(){O.fire("loading-progress",L)}function X(e,t){if(!z){l.style.opacity=1,Z(),p=(w=e).width,x=w.height;var n=w.particles;h=n.minFrameSpan,b=n.maxFrameSpan,y=(b-h)/I,_=a.createBuffer(f,n.particleAttributes),f.enable(f.BLEND),f.blendFunc(f.SRC_ALPHA,f.ONE_MINUS_SRC_ALPHA),f.useProgram(M.program),a.bindAttribute(f,_,M.a_particle,4),a.bindTexture(f,w.texture,2),t||J(),f.uniform4f(M.u_frame,C,h,b,S),f.uniform1f(M.u_max_y_value,n.maxYValue),f.uniform4f(M.u_sizes,p,x,k,B),f.uniform1i(M.u_image,2),f.drawArrays(f.POINTS,0,p*x)}}function Y(){g=0,j(),S===c?C<b?(C+=y,g=requestAnimationFrame(Y)):(S=u,K()):C<b?(C+=y,E===c&&C<b&&(C+=.5*y),g=requestAnimationFrame(Y)):(S=c,K());var e=(C-h)/(b-h);S===u&&(e=1-e),O.fire("frame",e)}function j(){f.useProgram(M.program),F&&(F=!1,f.uniform4f(M.u_sizes,p,x,k,B)),f.uniform4f(M.u_frame,C,h,b,S),f.drawArrays(f.POINTS,0,p*x)}function Q(){if(!z&&!g&&!v){var e=V;new Date-P<500&&(e=0),v=setTimeout(()=>{v=0,g=requestAnimationFrame(Y)},e)}}function J(){C=h}function K(){if(J(),S===E)O.fire("cycle-complete");else{var e=U;new Date-P<500&&(e=0),v=setTimeout(()=>{v=0,g=requestAnimationFrame(Y)},e)}}function Z(){_&&(f.deleteBuffer(_),_=null),w&&(f.deleteTexture(w.texture),w=null)}}},uWeX:function(e,t){e.exports=function(e){for(var t=e.buckets,n=t.length,r=[],i=e.ignoredBuckets,a=0;a<n;++a){var o=t[a];if(0!==o){var s=i&&i.has(a);r.push({bucketNumber:a,id:a/n,count:s?0:t[a],isFiltered:s,ratio:100*t[a]/(e.maxYValue*e.bucketWidth)})}}return r.sort((e,t)=>t.count-e.count),{step:1/n,isFiltered:i&&i.size>0,buckets:r,name:e.groupByFunctionName+" bucket "}}},viej:function(e,t,n){var r=n("TzId"),i=n("QmSG"),a=document.getElementById("scene");a&&function(e){var t=window.innerWidth,n=window.innerHeight;i.isSmallScreen()?n-=i.sidebarHeight:t-=i.sidebarWidth;e.width=t,e.height=n;var a={antialias:!1};if(e.getContext("webgl",a)||e.getContext("experimental-webgl",a)){window.webGLEnabled=!0;var o=r(e);window.scene=o}else window.webGLEnabled=!1}(a),n.e(0).then((()=>{n("A/fH")}).bind(null,n)).catch(n.oe)},vm2c:function(e,t){e.exports=function(e,t){return e.addEventListener("drop",r,!0),e.addEventListener("dragover",i),e.addEventListener("dragenter",n),e.addEventListener("dragleave",o),e.addEventListener("dragend",o),{dispose:function(){e.removeEventListener("drop",r),e.removeEventListener("dragover",i),e.removeEventListener("dragenter",n),e.removeEventListener("dragleave",o),e.removeEventListener("dragend",o)}};function n(e){a(e)&&e.preventDefault()}function r(e){o(),e.preventDefault();var n=e.dataTransfer,r=[];if(n.items){for(var i=0;i<n.items.length;i++)if("file"==n.items[i].kind){var a=n.items[i].getAsFile();r.push(a)}}else for(var i=0;i<n.files.length;i++){var a=n.files[i];r.push(a)}t(r)}function i(t){a(t)&&(t.preventDefault(),e.classList.add("drag-over"))}function a(e){if(!e.dataTransfer)return!1;if(e.dataTransfer.files&&e.dataTransfer.files.length>0)return!0;var t=e.dataTransfer.items;if(!t)return!1;for(var n=0;n<t.length;++n)if("file"===t[n].kind)return!0;return!1}function o(){e.classList.remove("drag-over")}}},xu59:function(e,t){e.exports=function(e,t){var n,r,i=(t=t||{}).scaleImage,a=t.maxPixels,o=new Image;return o.crossOrigin="",o.onload=function(){i&&function(e){a||(a=Math.min(window.innerWidth*window.innerHeight,409600)*window.devicePixelRatio);var t=e.width/e.height,n=Math.ceil(Math.sqrt(a*t)),r=Math.ceil(a/n);(n<e.height||r<e.width)&&(e.width=n,e.height=r)}(o),n(o)},o.onerror=function(e){r(e)},o.src=e.getUrl(),new Promise((e,t)=>{n=e,r=t})}},yZJi:function(e,t){e.exports=function(e){return e.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")}},zLWS:function(e,t){function n(e,t,n){var r=e.createShader(t);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(r));return r}e.exports={bindTexture:function(e,t,n){e.activeTexture(e.TEXTURE0+n),e.bindTexture(e.TEXTURE_2D,t)},createBuffer:function(e,t){var n=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW),n},bindAttribute:function(e,t,n,r){e.bindBuffer(e.ARRAY_BUFFER,t),e.enableVertexAttribArray(n),e.vertexAttribPointer(n,r,e.FLOAT,!1,0,0)},createProgram:function(e,t,r){var i=e.createProgram(),a=n(e,e.VERTEX_SHADER,t),o=n(e,e.FRAGMENT_SHADER,r);if(e.attachShader(i,a),e.attachShader(i,o),e.linkProgram(i),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(i));var s,c={program:i,unload:function(){e.deleteProgram(i)}},u=e.getProgramParameter(i,e.ACTIVE_ATTRIBUTES);for(s=0;s<u;s++){var l=e.getActiveAttrib(i,s);c[l.name]=e.getAttribLocation(i,l.name)}var m=e.getProgramParameter(i,e.ACTIVE_UNIFORMS);for(s=0;s<m;s++){var d=e.getActiveUniform(i,s);c[d.name]=e.getUniformLocation(i,d.name)}return c},createShader:n,createTexture:function(e,t){var n=e.createTexture(),r=e.RGBA,i=e.RGBA,a=e.UNSIGNED_BYTE;return e.bindTexture(e.TEXTURE_2D,n),e.texImage2D(e.TEXTURE_2D,0,r,i,a,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),n}}}},["viej"]);
//# sourceMappingURL=app.ee9cf0b91cd2ed6403d4.js.map