namespace Script {
  import ƒAid = FudgeAid;

  // get this from Configs
  let speed: number = 2;
  let health: number = 5;
  let power: number = 1;

  export class Octo extends Character {
    protected textureSrc: string = "./Images/ALTTP_Octo16x16.png";
    protected animations: ƒAid.SpriteSheetAnimations = {};

    private target: ƒ.Vector2;

    constructor() {
      super("Octo", new ƒ.Vector2(16, 16));

      this.speed = speed;
      this.health = health;
      this.power = power;

      this.spriteNode = new ƒAid.NodeSprite("FlameSprite");
      this.spriteNode.addComponent(new ƒ.ComponentTransform);
      this.appendChild(this.spriteNode);

      this.mtxLocal.translateX(3);
      this.mtxLocal.translateY(0);
    }

    public move(): void {

    }

    attack(): void {

    }

    public takeDamage(): void {
      throw new Error("Method not implemented.");
    }

    die(): void {
      throw new Error("Method not implemented.");
    }

    public update(): void {
      this.move();
    }

    public async initializeAnimations(): Promise<void> {
      let texture: ƒ.TextureImage = new ƒ.TextureImage();
      await texture.load(this.textureSrc);

      let coat: ƒ.CoatTextured = new ƒ.CoatTextured(ƒ.Color.CSS("white"), texture);

      let animationFrames: number = 2;
      let origin: ƒ.ORIGIN2D = ƒ.ORIGIN2D.CENTER;
      let offsetNext: ƒ.Vector2 = ƒ.Vector2.X(16);

      let rectangles: Rectangles = { "idle": [0, 0, 16, 16], "death": [32, 0, 16, 16] };

      this.initializeAnimationsByFrames(coat, rectangles, animationFrames, origin, offsetNext);

      this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.idle);
      // this.animState = Frame.Idle;
      this.spriteNode.setFrameDirection(1);
      this.spriteNode.framerate = 6;

    }
  }
}