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
    private UIElement: HTMLElement;

    public constructor(_type: GUIType, _value: number) {
      super();
      this.UIElement = document.querySelector("div#vui");
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
      this.UIElement.hidden = false;
      console.log("connect GUI");

      new ƒUI.Controller(this, this.UIElement);
    }

    protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }

    public adjustMaxHealth(_amount: number): void {
      let healthElement: HTMLInputElement = this.UIElement.querySelector('input[key="health"]');
      let healthMax: number = Number(healthElement.max);
      healthMax += _amount;
      healthElement.max = healthMax.toString();
    }
    /**
     * updateUI
     */
    // public updateUI() { }
  }
}