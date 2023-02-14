namespace Script {
  export enum State {
    Idle, Move, Attack, Die, Hurt
  }

  import ƒ = FudgeCore;
  export abstract class Character extends TexturedMoveable {
    protected hiddenTextureSrc: string = "./Images/Hidden.png";

    protected health: number;
    public power: number;
    public hitbox: ƒ.Vector2;
    protected state: State;
    protected hasIFrames: boolean;

    /**
     * Create an character (Node) and add an transform-component
     */
    constructor(_name: string, _spriteName: string, _spriteDimensions: ƒ.Vector2) {
      super(_name, _spriteName);

      this.hitbox = ƒ.Vector2.SCALE(_spriteDimensions, 1 / 32);
    }

    // protected abstract move(): void;
    abstract attack(_event?: Event | KeyboardEvent): void;
    public takeDamage(_sourcePower: number, _sourcePos: ƒ.Vector3): void {
      if (!this.hasIFrames) {

        this.health -= _sourcePower;
      }
    }
    abstract die(): void;
    abstract unveil(): void;

  }

}