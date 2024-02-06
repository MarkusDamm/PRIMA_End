///<reference path="./Entity.ts"/>
// ///<reference path="./Main.ts"/>
namespace Script {
  import ƒAid = FudgeAid;

  export class Octo extends Entity {
    // protected textureSrc: string = "./Images/ALTTP_Octo16x16.png";
    public readonly affinity = Affinity.Enemy;
    protected hasIFrames: boolean = false;

    private target: ƒ.Vector2;
    private targetUpdateTimeout: Timeout;


    constructor(_spawnPosition: ƒ.Vector3, _data: any) {
      super(_data);
      this.hasIFrames = false;
      // console.log("Health: ", this.health, "; Power: ", this.power, " Speed: ", this.speed);
      this.addEventListener("Damage", this.takeDamage.bind(this));
      this.addEventListener("enemyIsClose", this.unveil.bind(this));
      
      this.mtxLocal.translate(_spawnPosition);
      this.targetUpdateTimeout = { timeoutID: 0, duration: 0 };
      this.updateTarget();

      this.initializeAnimations();
    }

    protected move(_deltaTime: number): void {
      this.velocity = ƒ.Vector2.DIFFERENCE(this.target, this.mtxLocal.translation.toVector2());
      this.velocity.normalize(this.speed);
      this.velocity.scale(_deltaTime)
      this.mtxLocal.translateX(this.velocity.x);
      this.mtxLocal.translateY(this.velocity.y);
    }

    private updateTarget(): void {
      this.target = flame.mtxLocal.translation.toVector2();;

      this.targetUpdateTimeout.timeoutID = setTimeout(() => {
        this.updateTarget();
      }, 2500);
    }

    attack(): void {

    }

    public takeDamage(_event: CustomEvent): void {
      super.takeDamage(_event);

      if (this.health <= 0) {
        this.die();
      }
      // console.log(this, "takes damage ", _event.detail._sourcePos);
    }

    die(): void {
      hdlDestruction(this, entities);
    }

    public update(_deltaTime: number): void {
      this.move(_deltaTime);
    }

    protected async initializeAnimations(): Promise<void> {
      let rectangles: Rectangles = { "hidden": [0, 0, 16, 16] };
      await super.initializeAnimations(this.hiddenTextureSrc, rectangles, 1, 16);

      rectangles = { "idle": [0, 0, 16, 16], "death": [32, 0, 16, 16] };
      await super.initializeAnimations(this.textureSrc, rectangles, 2, 16);

      this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.hidden);
      this.state = State.Hidden;
    }

    protected unveil = (): void => {
      this.removeEventListener("enemyIsClose", this.unveil);
      this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.idle);
    }
  }
}