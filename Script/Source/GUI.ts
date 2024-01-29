namespace Script {
  import ƒ = FudgeCore;
  import ƒUI = FudgeUserInterface;

  export enum GUIType {
    Health, EnemyCount
  };

  export class GUI extends ƒ.Mutable {
    // need to use same name as key in elements
    public health: number;
    public enemyCounter: number;

    // public constructor(_value: number) {
    //   super();
    //   this.health = _value;
    //   let healthUI: HTMLElement = document.querySelector("div#vui");
    //   console.log("connect GUI");

    //   new ƒUI.Controller(this, healthUI);
    // }

    public constructor(_type: GUIType, _value: number) {
      super();
      switch (_type) {
        case GUIType.Health:
          this.health = _value;
          break;
        case GUIType.EnemyCount:
          this.enemyCounter = _value;
          break;

        default:
          break;
      }
      let UI: HTMLElement = document.querySelector("div#vui");
      console.log("connect GUI");

      new ƒUI.Controller(this, UI);
    }

    protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }

    /**
     * updateUI
     */
    public updateUI() {

    }
  }
}