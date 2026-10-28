import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GlassSaveButton, GlassLikeButton, GlassAddButton } from "@/components/glass/glass-state-button";

describe("stateful glass actions", () => {
  it("uses pointer feedback but makes keyboard activation instant", () => {
    const change = vi.fn();
    const {getByRole} = render(<GlassSaveButton onSavedChange={change}/>);
    fireEvent.click(getByRole("button", {name:"Save changes"}), {detail:1});
    const saved = getByRole("button", {name:"Saved"});
    expect(change).toHaveBeenLastCalledWith(true);
    expect(saved.querySelector("[data-animate]")).toHaveAttribute("data-animate","true");
    fireEvent.click(saved, {detail:0});
    expect(change).toHaveBeenLastCalledWith(false);
    expect(getByRole("button", {name:"Save changes"}).querySelector("[data-animate]")).toHaveAttribute("data-animate","false");
  });
  it("supports rapid reversals without stale timers or lost pressed state", () => {
    const {getByRole} = render(<><GlassLikeButton/><GlassAddButton/></>);
    const like = getByRole("button", {name:"Like"});
    fireEvent.click(like,{detail:1});
    fireEvent.click(like,{detail:1});
    expect(like).toHaveAttribute("aria-pressed","false");
    fireEvent.click(getByRole("button", {name:"Add to collection"}),{detail:1});
    const remove = getByRole("button", {name:"Remove from collection"});
    expect(remove).toHaveAttribute("aria-pressed","true");
    fireEvent.click(remove,{detail:0});
    expect(getByRole("button", {name:"Add to collection"})).toHaveAttribute("aria-pressed","false");
  });
});
