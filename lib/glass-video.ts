import {
  buildControlLensTextures,
  controlLensMetrics,
  resolveControlLens,
  type ControlLensInput,
} from "@/lib/glass-lens-optics";

export interface VideoGlassLens {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  parameters?: ControlLensInput;
}
const VERTEX = `attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const FRAGMENT = `precision highp float;
varying vec2 uv;
uniform sampler2D videoFrame;
uniform sampler2D map0; uniform sampler2D map1; uniform sampler2D map2; uniform sampler2D map3;
uniform vec2 size; uniform vec2 crop;
uniform vec2 sourceSize; uniform vec2 sourceOffset;
uniform float softness[4];
uniform vec4 rects[4]; uniform vec4 maps[4]; uniform float radii[4];
uniform int count; uniform float refraction;
vec3 source(vec2 p){vec2 v=(p+sourceOffset)/sourceSize;v.y=1.-v.y;return texture2D(videoFrame,clamp((v-.5)*crop+.5,0.,1.)).rgb;}
vec3 transmitted(vec2 p,float blur){
 if(blur<=0.)return source(p);
 return source(p)*.4+(source(p+vec2(blur,0.))+source(p-vec2(blur,0.))+source(p+vec2(0.,blur))+source(p-vec2(0.,blur)))*.15;
}
float chroma(vec3 c){return max(c.r,max(c.g,c.b))-min(c.r,min(c.g,c.b));}
void main(){
 vec2 point=vec2(uv.x*size.x,(1.-uv.y)*size.y);
 for(int i=0;i<4;i++){
  if(i>=count)break;
  vec4 rect=rects[i];vec2 p=point-rect.xy-rect.zw*.5;
  vec2 q=abs(p)-rect.zw*.5+radii[i];
  float distance=length(max(q,0.))+min(max(q.x,q.y),0.)-radii[i];
  if(distance>.75)continue;
  vec4 info=maps[i]; vec2 mapUV=(p+rect.zw*.5+info.x)/info.zw;
  vec3 field;
  if(i==0)field=texture2D(map0,mapUV).rgb;
  else if(i==1)field=texture2D(map1,mapUV).rgb;
  else if(i==2)field=texture2D(map2,mapUV).rgb;
  else field=texture2D(map3,mapUV).rgb;
  vec2 bend=(field.rg*255.-128.)/127.*info.y*refraction;
  vec2 samplePoint=point+bend;
  vec3 color=transmitted(samplePoint,softness[i])*clamp(1.+1.5*128./255.-1.5*field.b,0.,1.);
  float inside=max(0.,-distance);
  if(inside<10.){
   // The same vertical source column supplies hue AND rim height.
   vec3 a=source(vec2(samplePoint.x,rect.y+rect.w*.25));
   vec3 b=source(vec2(samplePoint.x,rect.y+rect.w*.5));
   vec3 c=source(vec2(samplePoint.x,rect.y+rect.w*.75));
   float wa=chroma(a),wb=chroma(b),wc=chroma(c),energy=wa+wb+wc;
   vec3 light=(a*wa+b*wb+c*wc)/max(.001,energy);
   float presence=clamp(energy*.7,0.,1.);
   float height=mix(.7,3.8,presence);
   color=mix(color,light,exp(-inside/height)*presence*.32);
   vec2 normal=normalize(max(q,vec2(.001))*sign(p));
   float facing=max(0.,dot(normal,vec2(-.707,-.707)));
   color=mix(color,vec3(1.),exp(-inside/.75)*(.025+.065*facing));
  }
  gl_FragColor=vec4(color,1.-smoothstep(-.5,.5,distance));return;
 }
 gl_FragColor=vec4(0.);
}`;

/** One video upload and one transparent canvas for every control lens. */
export class GlassVideoRenderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private buffer: WebGLBuffer;
  private video: WebGLTexture;
  private mapTextures: WebGLTexture[] = [];
  private lenses: VideoGlassLens[] = [];
  private metrics: number[] = [];
  private rectData = new Float32Array(16);
  private mapData = new Float32Array(16);
  private radiusData = new Float32Array(4);
  private blurData = new Float32Array(4);
  private imageSource = "";
  private locations = new Map<string, WebGLUniformLocation | null>();
  private geometry = "";
  private loading: Promise<HTMLImageElement[]> | null = null;
  private revision = 0;
  private disposed = false;
  private width = 1;
  private height = 1;
  private uniform(name: string) {
    if (!this.locations.has(name))
      this.locations.set(name, this.gl.getUniformLocation(this.program, name));
    return this.locations.get(name)!;
  }
  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error("WebGL unavailable");
    this.gl = gl;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(message ?? "Shader compilation failed");
      }
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX),
      fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram()!;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      throw new Error("Video shader link failed");
    }
    this.program = program;
    gl.useProgram(program);
    this.buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const texture = () => {
      const value = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, value);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([128, 128, 128, 255]),
      );
      return value;
    };
    this.video = texture();
    this.mapTextures = Array.from({ length: 4 }, texture);
    gl.uniform1i(gl.getUniformLocation(program, "videoFrame"), 0);
    for (let i = 0; i < 4; i++)
      gl.uniform1i(gl.getUniformLocation(program, `map${i}`), i + 1);
  }
  resize(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    const dpr = Math.min(
      1.5,
      devicePixelRatio || 1,
      Math.sqrt(1_500_000 / (this.width * this.height)),
    );
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  async setLenses(lenses: VideoGlassLens[]) {
    const next = lenses.slice(0, 4),
      key = JSON.stringify(next);
    if (key === this.geometry) {
      await this.loading;
      return;
    }
    this.geometry = key;
    this.lenses = next;
    const revision = ++this.revision;
    this.metrics = next.flatMap((lens) => {
      const p = resolveControlLens(lens.parameters),
        m = controlLensMetrics(lens.width, lens.height, p);
      return [
        m.pad,
        m.maximum,
        lens.width + m.pad * 2,
        lens.height + m.pad * 2,
      ];
    });
    this.rectData.fill(0);
    this.mapData.fill(0);
    this.radiusData.fill(0);
    this.blurData.fill(0);
    next.forEach((lens, i) => {
      this.rectData.set([lens.x, lens.y, lens.width, lens.height], i * 4);
      this.mapData.set(this.metrics.slice(i * 4, i * 4 + 4), i * 4);
      this.radiusData[i] = lens.radius;
      this.blurData[i] = resolveControlLens(lens.parameters).blur;
    });
    const images = await (this.loading = Promise.all(
      next.map(async (lens) => {
        const p = resolveControlLens(lens.parameters),
          image = new Image();
        image.src = buildControlLensTextures(
          lens.width,
          lens.height,
          lens.radius,
          p,
        ).displacement;
        await image.decode();
        return image;
      }),
    ));
    if (this.disposed || revision !== this.revision) return;
    const gl = this.gl;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    images.forEach((image, i) => {
      gl.activeTexture(gl.TEXTURE0 + i + 1);
      gl.bindTexture(gl.TEXTURE_2D, this.mapTextures[i]);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
    });
    this.canvas.dataset.lensMapRevisions = String(revision);
  }
  draw(source: HTMLVideoElement, refraction = true) {
    if (this.disposed || source.readyState < 2 || !source.videoWidth) return;
    this.imageSource = "";
    this.paint(source, source.videoWidth, source.videoHeight, refraction);
  }
  /** Static images use the very same shader, with a small aligned source window.
   * Their texture is uploaded on image change, never continuously while idle. */
  drawImage(
    source: HTMLImageElement,
    window: { x: number; y: number; width: number; height: number },
    refraction = true,
  ) {
    if (this.disposed || !source.complete || !source.naturalWidth) return;
    this.paint(source, source.naturalWidth, source.naturalHeight, refraction, window);
  }
  private paint(
    source: HTMLVideoElement | HTMLImageElement,
    sourceWidth: number,
    sourceHeight: number,
    refraction: boolean,
    window = { x: 0, y: 0, width: this.width, height: this.height },
  ) {
    const gl = this.gl,
      p = this.program;
    gl.useProgram(p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.video);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const imageKey = source instanceof HTMLImageElement ? source.currentSrc || source.src : "";
    if (!imageKey || imageKey !== this.imageSource) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      this.imageSource = imageKey;
    }
    this.mapTextures.forEach((texture, i) => {
      gl.activeTexture(gl.TEXTURE0 + i + 1);
      gl.bindTexture(gl.TEXTURE_2D, texture);
    });
    const scale = Math.max(
      window.width / sourceWidth,
      window.height / sourceHeight,
    );
    gl.uniform2f(this.uniform("size"), this.width, this.height);
    gl.uniform2f(this.uniform("sourceSize"), window.width, window.height);
    gl.uniform2f(this.uniform("sourceOffset"), window.x, window.y);
    gl.uniform2f(
      this.uniform("crop"),
      window.width / (sourceWidth * scale),
      window.height / (sourceHeight * scale),
    );
    gl.uniform4fv(this.uniform("rects[0]"), this.rectData);
    gl.uniform4fv(this.uniform("maps[0]"), this.mapData);
    gl.uniform1fv(this.uniform("radii[0]"), this.radiusData);
    gl.uniform1fv(this.uniform("softness[0]"), this.blurData);
    gl.uniform1i(this.uniform("count"), this.lenses.length);
    gl.uniform1f(this.uniform("refraction"), refraction ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  destroy() {
    this.disposed = true;
    this.revision++;
    const gl = this.gl;
    gl.deleteTexture(this.video);
    this.mapTextures.forEach((t) => gl.deleteTexture(t));
    gl.deleteBuffer(this.buffer);
    gl.deleteProgram(this.program);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
}
