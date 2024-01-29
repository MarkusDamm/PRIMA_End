///<reference path="./Entity.ts"/>
namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  enum Frames {
    RightIdle, Right, RightUp, LeftIdle, Left, LeftUp
  };

  export interface Timeout { timeoutID: number, duration: number };

  export class Flame extends Entity {
    protected textureSrc: string = "./Images/H-Sheet32x32.png";
    protected animations: ƒAid.SpriteSheetAnimations = {};
    private fireballTextureSrc: string = "./Images/Fireball16x16.png";
    public readonly affinity = Affinity.Flame;

    /**
     * saves the id from the last started timeout related to taking damage as well as the remaining duration
     */
    private hitTimeout: Timeout;
    private attackCooldown: number;
    private isAttackAvailable: boolean = true;
    private velocity: ƒ.Vector2 = new ƒ.Vector2();
    private gui: GUI;

    private lightNode: ƒ.Node;

    constructor() {
      super("Flame", "FlameSprite", new ƒ.Vector2(32, 32));

      this.speed = config.player.speed;
      this.health = config.player.health;
      this.power = config.player.power;
      this.attackCooldown = config.player.attackCooldown;
      console.log("Health: " + this.health);
      this.gui = new GUI(GUIType.Health, this.health);

      this.addEventListener("Damage", this.takeDamage.bind(this));

      // add light
      this.lightNode = new ƒ.Node("FlameLight");
      this.lightNode.addComponent(new ƒ.ComponentTransform);
      let light: ƒ.Light = new ƒ.LightPoint(ƒ.Color.CSS("white"));
      let cmpLight: ƒ.ComponentLight = new ƒ.ComponentLight(light);
      this.lightNode.addComponent(cmpLight);
      this.lightNode.mtxLocal.scale(ƒ.Vector3.ONE(20));
      this.appendChild(this.lightNode);

      this.hitTimeout = { timeoutID: 0, duration: 0 };

    }

    public get getSpeed(): number {
      return this.speed;
    }

    attack = (_event: KeyboardEvent): void => {
      if (this.isAttackAvailable) {

        let key: string = _event.key;
        let attackDirection: ƒ.Vector2;
        switch (key) {
          case ƒ.KEYBOARD_CODE.ARROW_UP:
            attackDirection = ƒ.Vector2.Y();
            break;
          case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
            attackDirection = ƒ.Vector2.X();
            break;
          case ƒ.KEYBOARD_CODE.ARROW_LEFT:
            attackDirection = ƒ.Vector2.X(-1);
            break;
          case ƒ.KEYBOARD_CODE.ARROW_DOWN:
            attackDirection = ƒ.Vector2.Y(-1);
            break;
          default: return;
        }
        let projectile: Projectile = new Projectile(this.mtxLocal.translation, attackDirection, Affinity.Flame, this.power, this.fireballTextureSrc);
        hdlCreation(projectile, projectiles);

        this.isAttackAvailable = false;
        setTimeout(() => {
          this.isAttackAvailable = true;
        }, this.attackCooldown);
      }
    }

    protected move(): void {
      let control: Control = Control.getInstance();
      // get inputs from control-class
      this.velocity.x = control.horizontal.getOutput();
      this.velocity.y = control.vertical.getOutput();

      // move the character
      this.mtxLocal.translate(this.velocity.toVector3());
    }

    die(): void {
      console.log("You Died!");
    }

    public takeDamage(_event: CustomEvent): void {
      super.takeDamage(_event);
      this.gui.health = this.health;
      console.log("Flame takes damage");

      if (!this.hasIFrames) {

        this.startIFrames(_event.detail._sourcePower * 1000);
      }
    }

    private startIFrames(_timeoutDuration: number): void {
      this.hasIFrames = true;

      if (this.hitTimeout.duration > _timeoutDuration) {
        return;
      }

      clearTimeout(this.hitTimeout.timeoutID);

      this.hitTimeout.timeoutID = setTimeout(() => {
        this.hasIFrames = false;
      }, _timeoutDuration);
      this.hitTimeout.duration = _timeoutDuration;
    }

    public update(): void {
      this.move();

      // update animation adjusted to current movement
      if (this.velocity.x >= 0) {
        if (this.velocity.y > 0)
          this.chooseAnimation(Frames.RightUp);
        else {
          if (getAmount(this.velocity.y) > getAmount(this.velocity.x))
            this.chooseAnimation(Frames.RightIdle);
          else
            this.chooseAnimation(Frames.Right);
        }
      }
      else {
        if (this.velocity.y > 0)
          this.chooseAnimation(Frames.LeftUp);
        else {
          if (getAmount(this.velocity.y) > getAmount(this.velocity.x))
            this.chooseAnimation(Frames.LeftIdle);
          else
            this.chooseAnimation(Frames.Left);
        }
      }

      this.hitTimeout.duration--;
      if (this.hitTimeout.duration < 0) {
        this.hitTimeout = { timeoutID: 0, duration: 0 };
      }

    }

    public async initializeAnimations(): Promise<void> {
      let rectangles: Rectangles = {
        "rightIdle": [0, 0, 32, 32], "right": [32, 0, 32, 32], "rightUp": [64, 0, 32, 32],
        "leftIdle": [0, 32, 32, 32], "left": [32, 32, 32, 32], "leftUp": [64, 32, 32, 32]
      };
      super.initializeAnimations(this.textureSrc, rectangles, 1, 32);

      this.chooseAnimation(Frames.RightIdle);

    }


    /**
     * adjusts the animation to the given _state
     * @param _state current Frame
     */
    private chooseAnimation(_state: Frames): void {
      switch (_state) {
        case Frames.RightIdle:
          this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.rightIdle);
          break;
        case Frames.Right:
          this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.right);
          break;
        case Frames.RightUp:
          this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.rightUp);
          break;
        case Frames.LeftIdle:
          this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.leftIdle);
          break;
        case Frames.Left:
          this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.left);
          break;
        case Frames.LeftUp:
          this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.leftUp);
          break;
        default:
          console.log("no valid Frame");
          break;
      }
    }

    private changeAttributes(_speedDifference: number, _healthDifference: number, _powerDifference: number, _cooldownDifference: number): void {
      this.speed += _speedDifference;
      this.health += _healthDifference;
      this.power += _powerDifference;
      this.attackCooldown += _cooldownDifference;
    }

    unveil(): void {
      // propably useless here
    }
  }
}