///<reference path="./Entity.ts"/>
///<reference path="./Main.ts"/>
namespace Script {
  import ƒAid = FudgeAid;

  export class Goriya extends Entity {
    // protected hiddenTextureSrc: string = "./Images/Goriya-Hidden22x25.png";
    // protected textureSrc: string = "./Images/Goriya22x25.png";

    public readonly affinity = Affinity.Enemy;
    protected hasIFrames: boolean = false;
    protected health: number = 10;

    private target: ƒ.Vector2;
    // private targetUpdateTimeout: Timeout;

    constructor(_spawnPosition: ƒ.Vector3, _data: any) {
      super(_data);
      this.hasIFrames = false;
      this.addEventListener("Damage", this.takeDamage.bind(this));
      this.addEventListener("enemyIsClose", this.unveil.bind(this));

      this.mtxLocal.translate(_spawnPosition);
      this.target = flame.mtxLocal.translation.toVector2();

      this.initializeAnimations();
    }

    protected attack(_event?: Event | KeyboardEvent): void {

    }

    protected die(): void {

    }

    protected unveil(): void {
      this.removeEventListener("enemyIsClose", this.unveil);
    }

    public update(_deltaTime: number): void {
      this.move(_deltaTime);
    }

    protected async initializeAnimations(): Promise<void> {
      let rectangles: Rectangles = { "hidden": [0, 0, 22, 25] };
      await super.initializeAnimations(this.hiddenTextureSrc, rectangles, 1, 22);
      
      rectangles = { "down": [0, 0, 22, 25], "up": [0, 25, 22, 25] };
      await super.initializeAnimations(this.textureSrc, rectangles, 3, 22);
      
      rectangles = { "side": [0, 50, 22, 25] };
      await super.initializeAnimations(this.textureSrc, rectangles, 2, 22);

      // Attack Animations need to be implemented

      this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.hidden);
      this.state = State.Hidden;
    }

    // Adjust later for enemy to fire fireballs
    protected move(_deltaTime: number): void {
      this.velocity = ƒ.Vector2.DIFFERENCE(this.target, this.mtxLocal.translation.toVector2());
      this.velocity.normalize(this.speed);
      this.velocity.scale(_deltaTime)
      this.mtxLocal.translateX(this.velocity.x);
      this.mtxLocal.translateY(this.velocity.y);
    }

  }
}