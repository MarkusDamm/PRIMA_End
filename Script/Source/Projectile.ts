///<reference path="./TexturedMoveable.ts"/>
namespace Script {

  export class Projectile extends TexturedMoveable {
    textureSrc: string = "./Images/Fireball16x16.png";
    static spriteDimensions: ƒ.Vector2 = new ƒ.Vector2(16, 16);
    protected animations: ƒAid.SpriteSheetAnimations = {};
    velocity: ƒ.Vector3;
    affinity: Affinity;
    power: number;

    constructor(_position: ƒ.Vector3, _direction: ƒ.Vector2, _affinity: Affinity, _power: number, _spriteSource: string) {
      super("Projectile", "ProjectileSprite", Projectile.spriteDimensions);
      this.mtxLocal.translate(_position);
      
      _direction.normalize(this.speed);
      // _direction.scale(this.speed);
      this.velocity = _direction.toVector3();
      
      this.affinity = _affinity;
      this.textureSrc = _spriteSource;
      this.power = _power;
      

      // add light
      let lightNode: ƒ.Node = new ƒ.Node("FlameLight");
      lightNode.addComponent(new ƒ.ComponentTransform);
      let light: ƒ.Light = new ƒ.LightPoint(ƒ.Color.CSS("white"));
      let cmpLight: ƒ.ComponentLight = new ƒ.ComponentLight(light);
      lightNode.addComponent(cmpLight);
      lightNode.mtxLocal.scale(ƒ.Vector3.ONE(5));
      this.appendChild(lightNode);

    }

    public update(_deltaTime: number): void {
      this.move(_deltaTime);
      this.checkForCollision();
    }

    protected move(_deltaTime: number): void {
      let distance: ƒ.Vector3 = new ƒ.Vector3(this.velocity.x, this.velocity.y);
      // distance.normalize(this.speed);
      distance.scale(_deltaTime)
      this.mtxLocal.translate(distance);
      
    }

    private checkForCollision(): void {
      for (const character of characters) {
        if (this.affinity != character.affinity) {
          let posDifference: ƒ.Vector3 | ƒ.Vector2 = ƒ.Vector3.DIFFERENCE(this.mtxLocal.translation, character.mtxLocal.translation);
          posDifference = posDifference.toVector2();
          if (posDifference.magnitude < 6) {
            let dimensions: ƒ.Vector2 = ƒ.Vector2.SUM(this.hitbox, character.hitbox);
            posDifference = new ƒ.Vector2(getAmount(posDifference.x), getAmount(posDifference.y));
            if (dimensions.x > posDifference.x && dimensions.y > posDifference.y) {
              // character.takeDamage(character.power, character.mtxLocal.translation);
              let damageEvent: Event = new CustomEvent("Damage", { bubbles: true, detail: { _sourcePower: this.power, _sourcePos: this.mtxLocal.translation } })
              character.dispatchEvent(damageEvent);
            }
          }
        }
      }
    }

    public async initializeAnimations(): Promise<void> {
      let rectangles: Rectangles = { "idle": [0, 0, 16, 16] };
      await super.initializeAnimations(this.textureSrc, rectangles, 1, this.resolution);

      this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.idle);

    }

  }
}