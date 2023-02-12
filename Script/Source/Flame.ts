namespace Script {
  import ƒAid = FudgeAid;

  // get this from Configs
  let speed: number = 10;
  let health: number = 10;
  let power: number = 5;


  interface Rectangles { [label: string]: number[]; }
  enum Frames {
    RightIdle, Right, RightUp, LeftIdle, Left, LeftUp
  };

  import ƒ = FudgeCore;
  export class Flame extends Character {
    protected textureSrc: string = "./Images/H-Sheet32x32.png";
    protected animations: ƒAid.SpriteSheetAnimations = {};

    velocity: ƒ.Vector2 = new ƒ.Vector2();
    protected speed: number = speed;
    protected health: number = health;
    protected power: number = power;

    lightNode: ƒ.Node;

    constructor() {
      super("Flame");
      this.mtxLocal.translateZ(1);
      this.spriteNode = new ƒAid.NodeSprite("FlameSprite");
      this.spriteNode.addComponent(new ƒ.ComponentTransform);
      this.appendChild(this.spriteNode);

      this.lightNode = new ƒ.Node("FlameLight");
      this.lightNode.addComponent(new ƒ.ComponentTransform);
      let light: ƒ.Light = new ƒ.LightPoint(ƒ.Color.CSS("white"));
      let cmpLight: ƒ.ComponentLight = new ƒ.ComponentLight(light);
      this.lightNode.addComponent(cmpLight);
      this.lightNode.mtxLocal.translateZ(1);
      this.lightNode.mtxLocal.scale(ƒ.Vector3.ONE(20));
      this.appendChild(this.lightNode);

    }

    public get getSpeed(): number {
      return this.speed;
    }

    attack(): void {

    }

    public move(): void {
      let control: Control = Control.getInstance();
      // get inputs from control-class
      this.velocity.x = control.horizontal.getOutput();
      this.velocity.y = control.vertical.getOutput();

      // move the character
      this.mtxLocal.translate(this.velocity.toVector3());
    }

    die(): void {

    }

    public takeDamage(): void {

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

    }

    public async initializeAnimations(): Promise<void> {
      let texture: ƒ.TextureImage = new ƒ.TextureImage();
      await texture.load(this.textureSrc);

      let coat: ƒ.CoatTextured = new ƒ.CoatTextured(ƒ.Color.CSS("white"), texture);

      let animationFrames: number = 1;
      let origin: ƒ.ORIGIN2D = ƒ.ORIGIN2D.CENTER;
      let offsetNext: ƒ.Vector2 = ƒ.Vector2.X(32);
      // let offsetWrap: ƒ.Vector2 = ƒ.Vector2.X(32 * 3);

      let rectangles: Rectangles = {
        "rightIdle": [0, 0, 32, 32], "right": [32, 0, 32, 32], "rightUp": [64, 0, 32, 32],
        "leftIdle": [0, 32, 32, 32], "left": [32, 32, 32, 32], "leftUp": [64, 32, 32, 32]
      };

      this.initializeAnimationsByFrames(coat, rectangles, animationFrames, origin, offsetNext);

      this.chooseAnimation(Frames.RightIdle);
      // this.animState = Frame.Idle;
      this.spriteNode.setFrameDirection(1);
      this.spriteNode.framerate = 12;

    }

    /**
    * initializes multiple animation with the same amount of frames
    */
    private initializeAnimationsByFrames(_coat: ƒ.CoatTextured, _rectangles: Rectangles, _frames: number, _orig: ƒ.ORIGIN2D, _offsetNext: ƒ.Vector2): void {
      for (let key in _rectangles) {
        const rec: number[] = _rectangles[key];
        let anim: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation(key, _coat);
        let fRec: ƒ.Rectangle = ƒ.Rectangle.GET(rec[0], rec[1], rec[2], rec[3]);
        anim.generateByGrid(fRec, _frames, this.resolution, _orig, _offsetNext);
        console.log(key);

        this.animations[key] = anim;
      }
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
  }
}