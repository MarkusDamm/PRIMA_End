///<reference path="./TexturedMoveable.ts"/>
namespace Script {

  export class Projectile extends TexturedMoveable {
    protected textureSrc: string = "./Images/Fireball16x16.png";
    private soundSrc: string = "./Sounds/explosion.wav";
    private cmpAudio: ƒ.ComponentAudio;
    static spriteDimensions: ƒ.Vector2 = new ƒ.Vector2(16, 16);
    protected animations: ƒAid.SpriteSheetAnimations = {};
    private velocity: ƒ.Vector3;
    protected speed: number = 3;
    private affinity: Affinity;
    private power: number;
    private state: State;

    constructor(_position: ƒ.Vector3, _direction: ƒ.Vector2, _affinity: Affinity, _power: number, _spriteSource: string) {
      super("Projectile", "ProjectileSprite", Projectile.spriteDimensions);
      this.mtxLocal.translate(_position);

      _direction.normalize(this.speed);
      _direction.scale(this.speed);
      this.velocity = _direction.toVector3();
      this.adjustSprite(_direction);

      this.affinity = _affinity;
      this.textureSrc = _spriteSource;
      this.power = _power;

      // add Audio Source
      let explosionAudio: ƒ.Audio = new ƒ.Audio(this.soundSrc);
      this.cmpAudio = new ƒ.ComponentAudio(explosionAudio, false, false);
      this.addComponent(this.cmpAudio);
      this.cmpAudio.volume += 5;
      this.cmpAudio.setPanner(ƒ.AUDIO_PANNER.CONE_INNER_ANGLE, 360);

      // add light
      let lightNode: ƒ.Node = new ƒ.Node("FlameLight");
      lightNode.addComponent(new ƒ.ComponentTransform);
      let light: ƒ.Light = new ƒ.LightPoint(ƒ.Color.CSS("white"));
      let cmpLight: ƒ.ComponentLight = new ƒ.ComponentLight(light);
      lightNode.addComponent(cmpLight);
      lightNode.mtxLocal.scale(ƒ.Vector3.ONE(5));
      this.appendChild(lightNode);

      this.initializeAnimations();
    }

    private adjustSprite(_direction: ƒ.Vector2): void {
      _direction.normalize();
      if (_direction.x == -1) // Left
        this.spriteNode.mtxLocal.rotateZ(180);
      if (_direction.y == 1) // Up
        this.spriteNode.mtxLocal.rotateZ(90);
      else if (_direction.y == -1)  // Down
        this.spriteNode.mtxLocal.rotateZ(270);
    }

    public update(_deltaTime: number): void {
      if (this.state != State.Die) {
        this.move(_deltaTime);
        this.checkForCollision();
      }
    }

    protected move(_deltaTime: number): void {
      let distance: ƒ.Vector3 = new ƒ.Vector3(this.velocity.x, this.velocity.y);
      // distance.normalize(this.speed);
      distance.scale(_deltaTime)
      this.mtxLocal.translate(distance);

      let pos: ƒ.Vector3 = this.mtxLocal.translation;
      if (pos.x > config.arena.dimensionX / 2 || pos.x < -config.arena.dimensionX / 2 ||
        pos.y > config.arena.dimensionY / 2 || pos.y < -config.arena.dimensionY / 2) {
        this.state = State.Die;
        hdlDestruction(this, projectiles);
      }
    }

    private checkForCollision(): void {
      for (const entity of entities) {
        if (this.affinity != entity.affinity) {
          let posDifference: ƒ.Vector3 | ƒ.Vector2 = ƒ.Vector3.DIFFERENCE(this.mtxLocal.translation, entity.mtxLocal.translation);
          posDifference = posDifference.toVector2();
          if (posDifference.magnitude < 6) {
            let dimensions: ƒ.Vector2 = ƒ.Vector2.SUM(this.hitbox, entity.hitbox);
            posDifference = new ƒ.Vector2(getAmount(posDifference.x), getAmount(posDifference.y));
            if (dimensions.x > posDifference.x && dimensions.y > posDifference.y) {
              // character.takeDamage(character.power, character.mtxLocal.translation);
              let damageEvent: Event = new CustomEvent("Damage", { bubbles: true, detail: { _sourcePower: this.power, _sourcePos: this.mtxLocal.translation } })
              entity.dispatchEvent(damageEvent);
              // play explosion
              this.cmpAudio.play(true);
              this.state = State.Die;
              // then destroy projectile
              setTimeout(() => {
                hdlDestruction(this, projectiles);
              }, 1000);
            }
          }
        }
      }
    }

    // private checkForCollision(): void {
    //   for (const entity of entities) {
    //     if (this.affinity != entity.affinity) {
    //       let posDifference: ƒ.Vector3 | ƒ.Vector2 = ƒ.Vector3.DIFFERENCE(this.mtxLocal.translation, entity.mtxLocal.translation);
    //       posDifference = posDifference.toVector2();
    //       if (posDifference.magnitude < 6) {
    //         let dimensions: ƒ.Vector2 = ƒ.Vector2.SUM(this.hitbox, entity.hitbox);
    //         posDifference = new ƒ.Vector2(getAmount(posDifference.x), getAmount(posDifference.y));
    //         if (dimensions.x > posDifference.x && dimensions.y > posDifference.y) {
    //           // character.takeDamage(character.power, character.mtxLocal.translation);
    //           let damageEvent: Event = new CustomEvent("Damage", { bubbles: true, detail: { _sourcePower: this.power, _sourcePos: this.mtxLocal.translation } })
    //           entity.dispatchEvent(damageEvent);
    //           // play explosion
    //           this.cmpAudio.play(true);
    //           this.state = State.Die;
    //           // then destroy projectile
    //           setTimeout(() => {
    //             hdlDestruction(this, projectiles);
    //           }, 1000);
    //         }
    //       }
    //     }
    //   }
    // }

    protected async initializeAnimations(): Promise<void> {
      let rectangles: Rectangles = { "idle": [0, 0, 16, 16] };
      await super.initializeAnimations(this.textureSrc, rectangles, 1, this.resolution);

      this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.idle);
      this.state = State.Idle;
    }

  }
}