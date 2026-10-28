import { afterEach, describe, expect, it, vi } from "vitest";
import { buildAtlasPixels, buildAtlasTextures, clearAtlasTextureCache, getAtlasTextureCacheStats, type AtlasLens } from "@/lib/glass-atlas";
import { GLASS_DEFAULT_PARAMS, DEFAULT_OPTICS, refractLensRay, buildLensTextures, clearLensMapCache } from "@/lib/glass";
const params = {...GLASS_DEFAULT_PARAMS};
const lens: AtlasLens = {x:20,y:20,width:60,height:40,radius:20};
const at = (x: number, y: number, width: number) => (y*width+x)*4;
afterEach(() => {vi.restoreAllMocks();clearAtlasTextureCache();});

describe("batched lens field", () => {
  it("matches independent displacement and composes both optical lighting layers into one texture",()=>{
    const images:Uint8ClampedArray[]=[];
    vi.spyOn(HTMLCanvasElement.prototype,"getContext").mockReturnValue({createImageData:(w:number,h:number)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:(image:ImageData)=>images.push(image.data.slice())} as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype,"toDataURL").mockReturnValue("data:image/png;base64,parity");clearLensMapCache();
    const optics={...DEFAULT_OPTICS,lightAngle:90};
    buildLensTextures(100,80,{radius:24,pad:0,splay:params.splay,feather:params.feather,curve:params.curve,shape:"squircle",optics});
    const atlas=buildAtlasPixels(100,80,[{x:0,y:0,width:100,height:80,radius:24,shape:"squircle"}],params,optics);
    const [shade,light,rim,displacement]=images;
    for(const [x,y] of [[1,40],[98,40],[50,1],[12,8],[50,40]]){
      const i=at(x,y,100),opacity=params.glint/100,l=light[i+3]/255*opacity,s=shade[i+3]/255*opacity,a=s+l*(1-s);
      expect([...atlas.displacement.slice(i,i+3)]).toEqual([...displacement.slice(i,i+3)]);
      expect([...atlas.rim.slice(i,i+4)]).toEqual([...rim.slice(i,i+4)]);
      expect(atlas.reflection[i+3]).toBe(Math.round(a*255));
      if(a)expect(atlas.reflection[i]).toBe(Math.round(255*l*(1-s)/a));
    }
    expect(atlas.reflection[at(1,40,100)]).toBeLessThan(255);
  });
  it("carries color onto both arcs without coloring the clear center or the gap",()=>{
    const atlas=buildAtlasPixels(100,80,[lens],params);
    expect(atlas.rim[at(50,20,100)+3]).toBeGreaterThan(100);
    expect(atlas.rim[at(50,59,100)+3]).toBeGreaterThan(100);
    expect(atlas.rim[at(50,40,100)+3]).toBe(0);
    expect(atlas.rim[at(50,10,100)+3]).toBe(0);
    const flat=buildAtlasPixels(100,80,[lens],params,{refractiveIndex:1});
    expect(flat.rim.filter((_,index)=>index%4===3).every(alpha=>alpha===0)).toBe(true);
  });
  it("masks and refracts the same squircle boundary as an independent lens",()=>{
    const shape={x:0,y:0,width:100,height:100,radius:20};
    const round=buildAtlasPixels(100,100,[shape],params),square=buildAtlasPixels(100,100,[{...shape,shape:"squircle"}],params);
    expect(round.mask[at(96,96,100)+3]).toBe(0);expect(square.mask[at(96,96,100)+3]).toBeGreaterThan(180);
    expect(square.displacement[at(96,96,100)]).not.toBe(128);
  });
  it("keeps the background and gaps neutral and clips circular corners", () => {
    const map = buildAtlasPixels(160,100,[lens,{...lens,x:100}],params);
    for (const [x,y] of [[0,0],[90,40],[20,20]]) {
      const i=at(x,y,map.width);
      expect([...map.displacement.slice(i,i+4)]).toEqual([128,128,128,255]);
      expect(map.mask[i+3]).toBe(0);
    }
    expect(map.mask[at(50,40,map.width)+3]).toBe(255);
    expect(map.mask[at(130,40,map.width)+3]).toBe(255);
  });
  it("uses the same Snell offset as the playground and has a flat center", () => {
    const map=buildAtlasPixels(100,80,[lens],params,{interior:0});
    const bevel=Math.min(params.splay+params.feather*.55,20*.65);
    const ray=refractLensRay(.5,bevel,DEFAULT_OPTICS);
    const expected=Math.round(128+Math.pow(ray.offset,params.curve/2.3)*127);
    const edge=at(50,20,map.width), middle=at(50,40,map.width);
    expect(map.displacement[edge+1]).toBe(expected);
    expect([...map.displacement.slice(middle,middle+3)]).toEqual([128,128,128]);
  });
  it("turns off bending at index one and changes highlights with the light direction", () => {
    const zero=buildAtlasPixels(100,80,[lens],params,{refractiveIndex:1});
    expect(zero.displacement.every((value,index)=>index%4===3?value===255:value===128)).toBe(true);
    expect(zero.reflection.every(value=>value===0||value===255)).toBe(true);
    const left=buildAtlasPixels(100,80,[lens],params,{lightAngle:-90});
    const right=buildAtlasPixels(100,80,[lens],params,{lightAngle:90});
    expect(left.reflection[at(20,40,100)+3]).toBeGreaterThan(right.reflection[at(20,40,100)+3]);
  });
  it("bounds pixel allocation and rejects malformed member geometry", () => {
    const big=buildAtlasPixels(8192,8192,[{...lens,width:NaN}],params);
    expect(big.width*big.height).toBeLessThanOrEqual(1_500_000);
    expect(big.mask.every(value=>value===0)).toBe(true);
  });
  it("reuses textures for tint, blur, depth and color changes, with a two-entry cache", () => {
    let encoded=0;
    vi.spyOn(HTMLCanvasElement.prototype,"getContext").mockReturnValue({createImageData:(w:number,h:number)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:vi.fn()} as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype,"toDataURL").mockImplementation(()=>`data:image/png;base64,${++encoded}`);
    const first=buildAtlasTextures(100,80,[lens],params);
    expect(buildAtlasTextures(100,80,[lens],{...params,blur:8,tint:.5,depth:80,brightness:1.2},{colorBleed:0})).toBe(first);
    expect(getAtlasTextureCacheStats()).toEqual({builds:1,hits:1,entries:1});
    buildAtlasTextures(101,80,[lens],params);
    buildAtlasTextures(102,80,[lens],params);
    expect(getAtlasTextureCacheStats().entries).toBe(2);
  });
});
