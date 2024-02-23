///<reference path="./Entity.ts"/>
///<reference path="./Main.ts"/>
namespace Script {
  import ƒAid = FudgeAid;

  enum Direction {
    Up, Right, Down, Left, None
  };

  enum GoriyaState {
    Idle, Move, Shoot
  }

  export class Goriya extends Entity {
    // protected hiddenTextureSrc: string = "./Images/Goriya-Hidden22x25.png";
    // protected textureSrc: string = "./Images/Goriya22x25.png";

    public readonly affinity = Affinity.Enemy;
    protected hasIFrames: boolean = false;
    protected health: number = 10;
    private static fireballSpriteSrc: string;
    private isAttackReady: boolean;
    private idleTimer: number;
    private static idleTimeout: number = 150;
    private target: ƒ.Vector2;
    private isUnveiled: boolean;
    private currentMoveAnimationDirection: Direction;
    private targetDirection: Direction;
    private cmpStateMachine: ƒAid.ComponentStateMachine<GoriyaState>;
    // private targetUpdateTimeout: Timeout;

    constructor(_spawnPosition: ƒ.Vector3, _data: any) {
      super(_data);
      this.hasIFrames = false;
      this.addEventListener("Damage", this.takeDamage.bind(this));
      this.addEventListener("enemyIsClose", this.unveil.bind(this));

      this.mtxLocal.translate(_spawnPosition);
      this.velocity = new ƒ.Vector2(0, 0);
      this.target = ƒ.Vector2.ZERO();
      this.isUnveiled = false;
      this.idleTimer = 0;
      this.isAttackReady = true;
      this.currentMoveAnimationDirection = Direction.None;
      this.targetDirection = Direction.None;
      this.cmpStateMachine = this.setupStateMachine();
      this.cmpStateMachine.transit(GoriyaState.Idle);

      this.addComponent(this.cmpStateMachine);

      this.initializeAnimations();
    }

    public static setFireballSrc(_textureSrc: string): void {
      if (!Goriya.fireballSpriteSrc) {
        Goriya.fireballSpriteSrc = _textureSrc;
      }
    }

    private setupStateMachine(): ƒAid.ComponentStateMachine<GoriyaState> {
      let cmpStateMachine: ƒAid.ComponentStateMachine<GoriyaState> = new ƒAid.ComponentStateMachine<GoriyaState>();
      let setup: ƒAid.StateMachineInstructions<GoriyaState> = new ƒAid.StateMachineInstructions<GoriyaState>();
      setup.setTransition(GoriyaState.Idle, GoriyaState.Move, <ƒ.General>this.transitChoosePosition);
      setup.setTransition(GoriyaState.Shoot, GoriyaState.Move, <ƒ.General>this.transitChoosePosition);
      setup.setTransition(GoriyaState.Move, GoriyaState.Idle, <ƒ.General>this.transitToIdle);
      setup.setTransition(GoriyaState.Shoot, GoriyaState.Idle, <ƒ.General>this.transitToIdle);
      setup.setAction(GoriyaState.Idle, <ƒ.General>this.actIdle);
      setup.setAction(GoriyaState.Move, <ƒ.General>this.actMove);
      setup.setAction(GoriyaState.Shoot, <ƒ.General>this.actShoot);
      cmpStateMachine.instructions = setup;
      return cmpStateMachine;
    }

    private transitChoosePosition = (_machine: ƒAid.ComponentStateMachine<GoriyaState>): void => {
      let flamePos: ƒ.Vector2 = flame.mtxLocal.translation.toVector2();
      this.targetDirection = Math.round(randomNumber(-0.49, 3.49));
      let targetDistanceToFlame: number = randomNumber(6, 10);
      switch (this.targetDirection) {
        case Direction.Up:
          this.target = ƒ.Vector2.SUM(flamePos, ƒ.Vector2.Y(-targetDistanceToFlame));
          break;
        case Direction.Right:
          this.target = ƒ.Vector2.SUM(flamePos, ƒ.Vector2.X(-targetDistanceToFlame));
          break;
        case Direction.Down:
          this.target = ƒ.Vector2.SUM(flamePos, ƒ.Vector2.Y(targetDistanceToFlame));
          break;
        case Direction.Left:
          this.target = ƒ.Vector2.SUM(flamePos, ƒ.Vector2.X(targetDistanceToFlame));
          break;
        default:
          console.error("No valid target Direction for Goriya!");
          break;
      }
    }

    private transitToIdle = (_machine: ƒAid.ComponentStateMachine<GoriyaState>): void => {
      this.idleTimer = 0;
    }

    private actIdle = (_machine: ƒAid.ComponentStateMachine<GoriyaState>): void => {
      this.idleTimer++;
      if (this.currentMoveAnimationDirection != Direction.Down) {
        this.currentMoveAnimationDirection = Direction.Down;
        this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.down)
      }
      if (this.idleTimer >= Goriya.idleTimeout) {
        this.isAttackReady = true;
        _machine.transit(GoriyaState.Move);
      }
    }

    private actMove = (_machine: ƒAid.ComponentStateMachine<GoriyaState>): void => {
      let deltaTime: number = ƒ.Loop.timeFrameGame / 1000;
      this.velocity = ƒ.Vector2.DIFFERENCE(this.target, this.mtxLocal.translation.toVector2());
      if (this.velocity.magnitude < 0.2) {
        _machine.transit(GoriyaState.Shoot)
        return;
      }
      this.velocity.normalize(this.speed);
      this.velocity.scale(deltaTime)
      this.mtxLocal.translateX(this.velocity.x);
      this.mtxLocal.translateY(this.velocity.y);
    }

    private actShoot = (_machine: ƒAid.ComponentStateMachine<GoriyaState>): void => {
      if (!this.isAttackReady) { return; }

      let attackDirection: ƒ.Vector2;
      switch (this.targetDirection) {
        case Direction.Up:
          attackDirection = ƒ.Vector2.Y();
          break;
        case Direction.Right:
          attackDirection = ƒ.Vector2.X();
          break;
        case Direction.Down:
          attackDirection = ƒ.Vector2.Y(-1);
          break;
        case Direction.Left:
          attackDirection = ƒ.Vector2.X(-1);
          break;
        default:
          console.warn("No valid target Direction for Goriya to attack.");
          return;
      }

      let projectile = new Projectile(this.mtxLocal.translation, attackDirection, Affinity.Enemy, this.power, Goriya.fireballSpriteSrc, new ƒ.Vector2(16, 7), 2);
      hdlCreation(projectile, projectiles);
      this.isAttackReady = false;
      _machine.transit(GoriyaState.Idle);
    }

    protected attack(_event?: Event | KeyboardEvent): void {

    }

    die(): void {
      hdlDestruction(this, entities);
    }

    protected unveil(): void {
      this.removeEventListener("enemyIsClose", this.unveil);
      this.isUnveiled = true;
      this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.side)
    }

    public update(_deltaTime: number): void {
      this.cmpStateMachine.act();
      console.log("Current Goriya State", this.cmpStateMachine.stateCurrent);

      // this.move(_deltaTime);

      if (this.isUnveiled && this.velocity.magnitude > 0.1) {
        if (this.velocity.y > 0 && this.velocity.y > getAmount(this.velocity.x) && this.currentMoveAnimationDirection != Direction.Up) {
          // move up
          this.currentMoveAnimationDirection = Direction.Up;
          this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.up)
        }
        else if (this.velocity.y <= 0 && getAmount(this.velocity.y) > getAmount(this.velocity.x) && this.currentMoveAnimationDirection != Direction.Down) {
          // move down
          this.currentMoveAnimationDirection = Direction.Down;
          this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.down)
        }
        else if (this.velocity.x < 0 && this.currentMoveAnimationDirection != Direction.Left) {
          // move left
          this.currentMoveAnimationDirection = Direction.Left;
          this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.side);
          // turn sprite
          this.spriteNode.mtxLocal.rotation = ƒ.Vector3.Y(180);
        }
        else if (this.currentMoveAnimationDirection != Direction.Right) {
          // move right
          this.currentMoveAnimationDirection = Direction.Right;
          this.spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>this.animations.side)
        }
      }
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
    // protected move(_deltaTime: number): void {
    //   this.velocity = ƒ.Vector2.DIFFERENCE(this.target, this.mtxLocal.translation.toVector2());
    //   this.velocity.normalize(this.speed);
    //   this.velocity.scale(_deltaTime)
    //   this.mtxLocal.translateX(this.velocity.x);
    //   this.mtxLocal.translateY(this.velocity.y);
    // }

  }
}