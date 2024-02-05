namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  enum GameState {
    Start, Running, Victory, Defeat
  };

  export class GameStateMachine extends ƒAid.StateMachine<GameState> {
    private static instance: GameStateMachine;
    private static instructions: ƒAid.StateMachineInstructions<GameState> = GameStateMachine.getInstructions();

    constructor() {
      super();
      this.instructions = GameStateMachine.instructions;

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;
    }

    /**
     * accsess the instance of GameStateMachine
     */
    public static getInstance(): GameStateMachine {
      if (!GameStateMachine.instance) {
        GameStateMachine.instance = new GameStateMachine();
        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, GameStateMachine.instance.update)
      }
      return GameStateMachine.instance;
    }

    /**
     * setup the instructions from the methods to the state
     */
    public static getInstructions(): ƒAid.StateMachineInstructions<GameState> {
      let setup: ƒAid.StateMachineInstructions<GameState> = new ƒAid.StateMachineInstructions();
      setup.transitDefault = GameStateMachine.transitDefault;
      setup.actDefault = GameStateMachine.actDefault;
      setup.setAction(GameState.Start, <ƒ.General>this.actStart);
      // setup.setAction(GameState.Running, <ƒ.General>this.actRunning);
      setup.setTransition(GameState.Start, GameState.Running, <ƒ.General>GameStateMachine.transitState);

      return setup;
    }

    private static transitDefault(_machine: GameStateMachine): void {
      //nothing?
      console.log("default transition");

    }

    private static actDefault(_machine: GameStateMachine) {
      //not needed?
      console.log("default action");

    }

    private static actStart(_machine: GameStateMachine) {
      //spawn enemies
      console.log("start action");

    }

    private static actRunning(_machine: GameStateMachine) {
      //not needed?
      console.log("running action");

    }

    private static transitState(_machine: GameStateMachine) {
      //not needed?
      console.log("state transition");

    }

    private update = (_event: Event): void => { this.act(); }
  }

}