///<reference path="./TexturedMoveable.ts"/>
///<reference path="./Main.ts"/>
namespace Script {
  import ƒ = FudgeCore;

  export abstract class Entity extends TexturedMoveable {
    protected hiddenTextureSrc: string;

    protected data: any;
    protected health: number;
    public power: number;
    protected state: State;
    protected hasIFrames: boolean = false;
    protected velocity: ƒ.Vector2;
    public readonly affinity: Affinity;

    protected animations: ƒAid.SpriteSheetAnimations = {};


    /**
     * Create an character (Node) and add an transform-component
     */
    constructor(_data: any) {
      super(_data.name, _data.name + "Sprite", new ƒ.Vector2(_data.spriteDimensions[0], _data.spriteDimensions[1]));
      this.data = _data;
      this.textureSrc = this.data.textureSrc;
      this.hiddenTextureSrc = this.data.hiddenTextureSrc;
      this.speed = this.data.speed;
      this.health = this.data.health;
      this.power = this.data.power;
    }

    // protected abstract move(): void;
    protected abstract attack(_event?: Event | KeyboardEvent): void;
    protected abstract die(): void;
    protected abstract unveil(): void;

    public takeDamage(_event: CustomEvent): void {
      if (!this.hasIFrames) {
        this.health -= _event.detail._sourcePower;
      }
      if (this.health <= 0) {
        this.die();
      }
      // console.log(this.health);
    }
  }
}