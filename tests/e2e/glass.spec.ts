import { test, expect } from "@playwright/test";

test("homepage shows the composed controls together and supports state changes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", {name:"Liquid Glass",exact:true})).toBeVisible();
  await expect(page.getByRole("button", {name:"Play music and expand",exact:true})).toBeVisible();
  await expect(page.getByRole("switch", {name:"AirDrop",exact:true})).toBeVisible();
  await expect(page.getByRole("heading", {name:"Leave this site?",exact:true})).toBeVisible();
  await expect(page.getByRole("heading", {name:"Shut down this preview?",exact:true})).toBeVisible();
  await page.getByRole("button", {name:"Save changes",exact:true}).click();
  await expect(page.getByRole("button", {name:"Saved",exact:true})).toBeVisible();
  await page.getByRole("button", {name:"Bookmark this site",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Bookmark this page"})).toBeVisible();
  await expect(page.getByRole("button",{name:"Copy link"})).toBeVisible();
});

test("shutdown remains separate from leaving and secondary actions are plain",async({page})=>{
  await page.goto("/");
  const secondary=page.locator('[data-glass-button="secondary"]').filter({hasText:"Documentation"});
  await expect(secondary).toHaveCSS("background-image","none");
  await expect(secondary).toHaveCSS("backdrop-filter","none");
  await page.getByRole("button",{name:"Shut down",exact:true}).click();
  await expect(page.getByRole("button",{name:"Wake preview",exact:true})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Leave this site?",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Wake preview",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Shut down this preview?",exact:true})).toBeVisible();
});

test("drawer refracts lower surfaces and returns focus to its actual trigger", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {name:"Open library drawer",exact:true});
  await trigger.click();
  const dialog = page.getByRole("dialog", {name:"Your library",exact:true});
  const lens = dialog.locator('[data-glass="drawer"]');
  await expect(lens).toHaveAttribute("data-refraction","scene-svg");
  await expect(lens.locator('[data-glass-captured-layer]').first()).toBeAttached();
  await dialog.getByRole("button", {name:"Slow tide",exact:true}).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("heading", {name:"Slow tide",exact:true})).toBeVisible();
  await expect(trigger).toBeFocused();
});

test("changing the active budget releases old mirrors", async ({ page }) => {
  await page.goto("/lab");
  await page.getByRole("radiogroup", {name:"Mounted surfaces",exact:true}).getByRole("radio", {name:"8",exact:true}).click();
  for (const limit of [3,5]) {
    await page.getByRole("radiogroup", {name:"Active surface limit",exact:true}).getByRole("radio", {name:String(limit),exact:true}).click();
    await page.getByRole("button", {name:"Run benchmark",exact:true}).click();
    await expect(page.getByRole("button", {name:"Run benchmark",exact:true})).toBeEnabled();
    const result = JSON.parse(await page.getByTestId("glass-performance-result").innerText());
    expect(result.active).toBe(limit);
    expect(result.mirrors).toBe(limit);
  }
});

test("phone pages have no horizontal overflow", async ({ page }) => {
  for (const width of [320,390]) {
    await page.setViewportSize({width,height:844});
    for (const path of ["/","/components","/playground","/docs","/docs/performance"]) {
      await page.goto(path);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
    }
  }
});

test("sharing retains its choice while disabled", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("radio", {name:"Everyone",exact:true}).click();
  await page.getByRole("switch", {name:"AirDrop",exact:true}).click();
  await expect(page.getByRole("radio", {name:"Everyone",exact:true})).toBeDisabled();
  await expect(page.getByRole("radio", {name:"Everyone",exact:true})).toHaveAttribute("aria-checked","true");
});

test("component search filters results and returns focus", async ({ page }) => {
  await page.goto("/");
  const trigger=page.getByRole("button", {name:"Search components",exact:true});
  await trigger.click();
  await page.getByRole("combobox").fill("switch");
  await expect(page.getByRole("option", {name:"Switch",exact:true})).toBeVisible();
  await expect(page.getByRole("option", {name:"Slider",exact:true})).toHaveCount(0);
  await page.getByRole("combobox").press("Escape");
  await expect(trigger).toBeFocused();
});

test("reduced motion leaves the scroll source still", async ({ page }) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/");
  await page.getByRole("button", {name:"Stay here",exact:true}).scrollIntoViewIfNeeded();
  await expect(page.locator('.showcase-story')).toHaveAttribute("data-scroll-stage","still");
  await expect(page.locator('.showcase-photo-ocean')).toHaveCSS("opacity","0");
});


test("homepage has independent controls, bare transports and a keyboard-accessible dock", async ({page}) => {
  await page.setViewportSize({width:1280,height:900});
  await page.goto("/");
  const sound = page.getByRole("slider", {name:"MacBook Pro Speakers"}).locator('xpath=ancestor::*[@data-liquid-glass][1]');
  await expect(sound).toHaveCSS("border-radius","20px");
  await page.getByRole("button",{name:"Play music and expand",exact:true}).click();
  await expect(page.getByRole("button",{name:"Previous track",exact:true})).toHaveAttribute("data-glass-button","bare");
  await expect(page.getByRole("slider",{name:"Collection refraction"})).toHaveCount(0);
  const dock = page.getByRole("navigation",{name:"Explore Liquid Glass"});
  await dock.getByRole("button").press("Shift+Tab");
  await expect(page.getByRole("tooltip",{name:"Documentation"})).toBeVisible();
});

test("elastic demo bends independently while preserving the shared scene", async ({page}) => {
  await page.goto("/");
  const button = page.getByRole("button",{name:"Pull glass",exact:true});
  await button.scrollIntoViewIfNeeded();
  const rect = await button.boundingBox();
  await page.mouse.move(rect!.x+rect!.width/2,rect!.y+rect!.height/2);
  await page.mouse.down();
  await expect(button).toHaveAttribute("data-elastic-held","true");
  await expect(button).toHaveAttribute("data-refraction","scene-svg");
  expect(await page.locator('[data-glass-rendering="active"]').count()).toBeLessThanOrEqual(5);
  await page.mouse.up();
  await expect(button).toHaveAttribute("data-elastic-held","false");
});


test("homepage composites every independent shape and keeps the composition fixed at scroll end", async ({page}) => {
  await page.setViewportSize({width:1280,height:900});
  await page.goto("/");
  const atlas=page.locator('[data-glass-atlas]');
  await expect(atlas).toHaveAttribute("data-refraction","scene-atlas");
  await expect(page.getByRole("button",{name:"Save changes",exact:true})).toHaveAttribute("data-refraction","scene-atlas");
  const before=await page.getByRole("heading",{name:"Liquid Glass",exact:true}).boundingBox();
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  const after=await page.getByRole("heading",{name:"Liquid Glass",exact:true}).boundingBox();
  expect(after!.y).toBeCloseTo(before!.y,1);
  expect(await page.locator('[data-glass-rendering="active"]:not([data-glass-mirror] *)').count()).toBeLessThanOrEqual(3);
});


test("opening the homepage drawer preserves the atlas dimensions and map", async ({page}) => {
  await page.setViewportSize({width:1280,height:900});await page.goto("/");
  const atlas=page.locator('[data-glass-atlas]');await expect(atlas).toHaveAttribute("data-refraction","scene-atlas");
  const before=await atlas.boundingBox(), maps=await atlas.getAttribute("data-atlas-map-builds");
  await page.getByRole("button",{name:"Open library drawer",exact:true}).click();
  await expect(page.getByRole("dialog",{name:"Your library"})).toBeVisible();
  expect((await atlas.boundingBox())!.width).toBe(before!.width);await expect(atlas).toHaveAttribute("data-atlas-map-builds",maps!);
  await page.getByRole("button",{name:"Morning light",exact:true}).press("Escape");
  await expect(page.getByRole("button",{name:"Open library drawer",exact:true})).toBeFocused();
});


test("refraction comparison reuses the field and switches only displacement",async({page})=>{
  await page.goto("/");const atlas=page.locator('[data-glass-atlas]');await expect(atlas).toHaveAttribute("data-refraction","scene-atlas");
  const builds=await atlas.getAttribute("data-atlas-map-builds");await page.getByRole("switch",{name:"Refraction",exact:true}).click();
  await expect(atlas).toHaveAttribute("data-refraction","disabled");await expect(atlas.locator('svg > filter:last-child feDisplacementMap').first()).toHaveAttribute("scale","0");await expect(atlas).toHaveAttribute("data-atlas-map-builds",builds!);
  await page.getByRole("switch",{name:"Refraction",exact:true}).click();await expect(atlas).toHaveAttribute("data-refraction","scene-atlas");
});
test("notification and attached photo are actual overlays",async({page})=>{
  await page.goto("/");await page.getByRole("button",{name:"Show notification"}).click();await expect(page.locator('[data-glass="toast"]').filter({hasText:"Photo received"})).toBeVisible();
  await page.getByRole("button",{name:"Open photo from Alex"}).click();await expect(page.getByRole("dialog",{name:"A photo from Alex"})).toBeVisible();await page.getByRole("button",{name:"Close",exact:true}).click();
});

test("desktop controls stay fixed at the last scroll pixel at short and tall heights",async({page})=>{
  for(const height of [640,687,720,900]){
    await page.setViewportSize({width:1280,height});await page.goto("/");
    const heading=page.getByRole("heading",{name:"Liquid Glass",exact:true}),dock=page.locator(".showcase-dock-position");
    const before=[(await heading.boundingBox())!.y,(await dock.boundingBox())!.y];
    await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
    await expect(page.locator("[data-scroll-progress]")).toHaveAttribute("data-scroll-progress","1.000");
    expect([(await heading.boundingBox())!.y,(await dock.boundingBox())!.y]).toEqual(before);
  }
});

test("player expansion preserves layout and collapsing removes independent optics",async({page})=>{
  await page.goto("/");const library=page.getByRole("navigation",{name:"Library preview"}),before=await library.boundingBox();
  await page.getByRole("button",{name:"Play music and expand",exact:true}).click();
  const full=page.locator('[data-player-expanded="true"]');await expect(full).toHaveAttribute("data-refraction","scene-svg");
  expect((await library.boundingBox())!.y).toBe(before!.y);
  await page.getByRole("button",{name:"Minimize music player",exact:true}).click();
  const mini=page.locator('[data-player-expanded="false"]');await expect(mini).toHaveAttribute("data-refraction","scene-atlas");
  await expect(mini.locator('[data-glass-reflection],[data-glass-blur]')).toHaveCount(0);
});

test("playground scene actions align and adaptive text uses blur instead of displacement",async({page})=>{
  await page.setViewportSize({width:1280,height:900});await page.goto("/playground");
  await expect(page.getByRole("contentinfo")).toHaveCount(0);
  const actions=page.getByTestId("playground-scene-actions").getByRole("button");
  const boxes=await actions.evaluateAll(nodes=>nodes.map(node=>({height:node.getBoundingClientRect().height,top:node.getBoundingClientRect().top})));
  expect(boxes).toHaveLength(5);expect(boxes.every(box=>box.height===40&&box.top===boxes[0].top)).toBe(true);
  const handle=page.getByRole("button",{name:"Move lens",exact:true}),lens=page.getByTestId("engine-lens");
  for(let i=0;i<16;i++)await handle.press("Shift+ArrowUp");
  for(let i=0;i<16;i++)await handle.press("Shift+ArrowLeft");
  await expect(lens).toHaveAttribute("data-glass-backdrop","content");
  await expect(lens).toHaveAttribute("data-glass-blur-px","8");await expect(lens).toHaveAttribute("data-glass-depth-px","0");
  await page.getByRole("switch",{name:"Adapt to content",exact:true}).click();
  await expect(lens).toHaveAttribute("data-glass-depth-px","28");await expect(lens).toHaveAttribute("data-glass-blur-px","4");
});
