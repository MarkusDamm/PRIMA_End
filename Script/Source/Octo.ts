namespace Script {
  import ƒAid = FudgeAid;

  export class Octo extends Character {
    protected textureSrc: string = "./Images/ALTTP_Octo16x16.png";
    protected animations: ƒAid.SpriteSheetAnimations = {};

    private target: ƒ.Vector3;
    private targetUpdateTimeout: Timeout;


    constructor(_spawnPosition: ƒ.Vector3) {
      super("Octo", "OctoSprite", new ƒ.Vector2(16, 16));

      this.speed = config.enemy.speed;
      this.health = config.enemy.health;
      this.power = config.enemy.power;

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
      super.initializeAnimations(this.hiddenTextureSrc, { "hidden": [0, 0, 16, 16] }, 1, 16);

      let rectangles: Rectangles = { "idle": [0, 0, 16, 16], "death": [32, 0, 16, 16] };
      super.initializeAnimations(this.textureSrc, rectangles, 2, 16);

      this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.hidden);

    }

    unveil = (): void => {
      this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.idle);
    }
  }
}