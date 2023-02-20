///<reference path="./TexturedMoveable.ts"/>
namespace Script {
  import ƒ = FudgeCore;

  export abstract class Character extends TexturedMoveable {
    protected hiddenTextureSrc: string = "./Images/Hidden.png";

    protected health: number;
    public power: number;
    protected state: State;
    protected hasIFrames: boolean = false;
    public readonly affinity: Affinity;

    /**
     * Create an character (Node) and add an transform-component
     */
    constructor(_name: string, _spriteName: string, _spriteDimensions: ƒ.Vector2) {
      super(_name, _spriteName, _spriteDimensions);
    }

    // protected abstract move(): void;
    abstract attack(_event?: Event | KeyboardEvent): void;
    public takeDamage = (_event: CustomEvent): void => {
      if (!this.hasIFrames) {
        this.health -= _event.detail._sourcePower;
      }
      console.log(this.health);
      
    }
    abstract die(): void;
    abstract unveil(): void;

  }

}