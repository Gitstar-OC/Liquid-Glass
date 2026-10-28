import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { registerGlassLens, getGlassBudgetSnapshot } from "@/lib/glass-performance";
let cleanup: (()=>void)[];
let changed: IntersectionObserverCallback;
beforeEach(()=>{
 cleanup=[];
 Object.defineProperty(document,"hidden",{configurable:true,value:false});
 vi.stubGlobal("matchMedia",()=>({matches:false}));
 vi.stubGlobal("IntersectionObserver",class {constructor(callback:IntersectionObserverCallback){changed=callback;}observe(){}unobserve(){}disconnect(){}});
});
afterEach(()=>{cleanup.forEach(dispose=>dispose());vi.unstubAllGlobals();document.body.replaceChildren();});
function add(options: {priority?:number;limit?:number}={}) {
 const element=document.createElement("div");element.getBoundingClientRect=()=>new DOMRect(0,0,100,100);document.body.append(element);
 const update=vi.fn();cleanup.push(registerGlassLens(element,update,options));return {element,update};
}
describe("document-wide glass budget",()=>{
 it("caps desktop lenses at five and prioritizes overlays",()=>{
  const panels=Array.from({length:8},()=>add());expect(getGlassBudgetSnapshot().active).toBe(5);
  const overlay=add({priority:10});expect(overlay.update).toHaveBeenLastCalledWith(true);expect(getGlassBudgetSnapshot().active).toBe(5);
  expect(panels[4].update).toHaveBeenLastCalledWith(false);
 });
 it("temporarily admits a held lens without exceeding the cap or displacing an overlay",()=>{
  Array.from({length:5},()=>add({priority:2}));
  const held=add({priority:5});const overlay=add({priority:10});
  expect(held.update).toHaveBeenLastCalledWith(true);
  expect(overlay.update).toHaveBeenLastCalledWith(true);
  expect(getGlassBudgetSnapshot().active).toBe(5);
  cleanup[5]();
  expect(getGlassBudgetSnapshot().active).toBe(5);
 });
 it("caps coarse-pointer devices at three even when five is requested",()=>{
  vi.stubGlobal("matchMedia",()=>({matches:true}));Array.from({length:8},()=>add({limit:5}));expect(getGlassBudgetSnapshot().active).toBe(3);
 });
 it("releases offscreen and hidden work and restores it without polling",()=>{
  const first=add();Array.from({length:5},()=>add());
  changed([{target:first.element,isIntersecting:false, boundingClientRect:new DOMRect(),intersectionRect:new DOMRect(),intersectionRatio:0,rootBounds:null,time:0}],{} as IntersectionObserver);
  expect(first.update).toHaveBeenLastCalledWith(false);expect(getGlassBudgetSnapshot().active).toBe(5);
  Object.defineProperty(document,"hidden",{configurable:true,value:true});document.dispatchEvent(new Event("visibilitychange"));expect(getGlassBudgetSnapshot().active).toBe(0);
  Object.defineProperty(document,"hidden",{configurable:true,value:false});document.dispatchEvent(new Event("visibilitychange"));expect(getGlassBudgetSnapshot().active).toBe(5);
 });
 it("notifies an inactive replacement registration instead of retaining its old state",()=>{
  Array.from({length:3},()=>add({limit:3}));
  const element=document.createElement("div");element.getBoundingClientRect=()=>new DOMRect(0,0,100,100);
  const update=vi.fn();update(true);cleanup.push(registerGlassLens(element,update,{limit:3}));
  expect(update).toHaveBeenLastCalledWith(false);
 });
 it("honors a lower requested limit and frees all registrations on unmount",()=>{
  Array.from({length:8},()=>add({limit:3}));expect(getGlassBudgetSnapshot().active).toBe(3);
  cleanup.forEach(dispose=>dispose());expect(getGlassBudgetSnapshot().registered).toBe(0);
 });
});
