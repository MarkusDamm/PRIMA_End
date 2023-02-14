namespace Script {
  export enum Affinity { Flame, Enemy }

  export class Projectile extends TexturedMoveable {
    spriteSource: string;
    velocity: ƒ.Vector2;
    affinity: Affinity;

    constructor(_position: ƒ.Vector3, _direction: ƒ.Vector2, _affinity: Affinity, _spriteSource: string) {
      super("Projectile", "ProjectileSprite");
      this.addComponent(new ƒ.ComponentTransform);
      this.mtxLocal.translate(_position);

      _direction.normalize;
      _direction.scale(this.speed);
      this.velocity = _direction

      this.affinity = _affinity;
      this.spriteSource = _spriteSource;
    }

    public update(_deltaTime: number): void {
      throw new Error("Method not implemented.");
    }

  }
}