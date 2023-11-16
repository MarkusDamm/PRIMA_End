namespace Script {
  import ƒ = FudgeCore;
  import ƒUI = FudgeUserInterface;

  export class GUI extends ƒ.Mutable {
    // need to use same name as key in elements
    public health: number;

    public constructor(_health: number) {
      super();
      this.health = _health;
      let healthUI: HTMLElement = document.querySelector("div#vui");
      console.log("connect health");
      
      new ƒUI.Controller(this, healthUI);
    }

    protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }

    /**
     * updateUI
     */
    public updateUI() {
      
    }
  }
}