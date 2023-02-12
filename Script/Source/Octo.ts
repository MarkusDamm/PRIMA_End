namespace Script {
  import ƒAid = FudgeAid;

  // get this from Configs
  let speed: number = 2;
  let health: number = 5;
  let power: number = 1;

  export class Octo extends Character {
    protected textureSrc: string = "./Images/ALTTP_Octo16x16.png";
    protected animations: ƒAid.SpriteSheetAnimations = {};

    private target: ƒ.Vector3;
    private targetUpdateTimeout: Timeout;


    constructor(_spawnPosition: ƒ.Vector3) {
      super("Octo", new ƒ.Vector2(16, 16));

      this.speed = speed;
      this.health = health;
      this.power = power;

      this.spriteNode = new ƒAid.NodeSprite("FlameSprite");
      this.spriteNode.addComponent(new ƒ.ComponentTransform);
      this.appendChild(this.spriteNode);

      this.mtxLocal.translate(_spawnPosition);

      this.targetUpdateTimeout = { timeoutID: 0, duration: 0 };
      this.updateTarget();
    }

    protected move(_deltaTime: number): void {
      let dir: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(this.target, this.mtxLocal.translation);
      dir.normalize(this.speed);
      dir.scale(_deltaTime)
      this.mtxLocal.translateX(dir.x);
      this.mtxLocal.translateY(dir.y);
    }

    private updateTarget(): void {
      this.target = flame.mtxLocal.translation;

      this.targetUpdateTimeout.timeoutID = setTimeout(() => {
        this.updateTarget();
      }, 2500);
    }

    attack(): void {

    }

    public takeDamage(): void {
      throw new Error("Method not implemented.");
    }

    die(): void {
      throw new Error("Method not implemented.");
    }

    public update(_deltaTime: number): void {
      this.move(_deltaTime);
    }

    public async initializeAnimations(): Promise<void> {
      super.initializeAnimations();
      let texture: ƒ.TextureImage = new ƒ.TextureImage();
      await texture.load(this.textureSrc);

      let coat: ƒ.CoatTextured = new ƒ.CoatTextured(ƒ.Color.CSS("white"), texture);

      let animationFrames: number = 2;
      let origin: ƒ.ORIGIN2D = ƒ.ORIGIN2D.CENTER;
      let offsetNext: ƒ.Vector2 = ƒ.Vector2.X(16);

      let rectangles: Rectangles = { "idle": [0, 0, 16, 16], "death": [32, 0, 16, 16] };

      this.initializeAnimationsByFrames(coat, rectangles, animationFrames, origin, offsetNext);

      this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.hidden);
      // this.animState = Frame.Idle;
      this.spriteNode.setFrameDirection(1);
      this.spriteNode.framerate = 6;

    }

    unveil = (): void => {
      this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.idle);
    }
  }
}