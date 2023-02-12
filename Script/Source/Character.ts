namespace Script {
  export enum State {
    Idle, Move, Attack, Die
  }

  import ƒ = FudgeCore;
  export abstract class Character extends ƒ.Node {
    protected textureSrc: string;
    protected spriteNode: ƒAid.NodeSprite;
    protected animations: ƒAid.SpriteSheetAnimations;

    protected resolution: number = 16;
    protected health: number;
    protected speed: number;
    protected power: number;
    protected state: State;

    /**
     * Create an character (Node) and add an transform-component
     */
    constructor(_name: string){
      super(_name);
      this.addComponent(new ƒ.ComponentTransform);
    }

    public abstract move(): void;
    abstract attack():void; 
    public abstract takeDamage():void; 
    abstract die():void; 
    public abstract update():void; 
    public abstract initializeAnimations(_anim: Animation):void; 

  }

}