namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  export enum GameState {
    Wait, Start, NextStage, Victory, Defeat
  };

  interface Stage {
    enemyCount: number,
    enemyType: string[]
  }

  export class GameStateMachine extends ƒAid.StateMachine<GameState> {
    private static instance: GameStateMachine;
    private static instructions: ƒAid.StateMachineInstructions<GameState> = GameStateMachine.getInstructions();

    private stages: Stage[];
    private currentStage: number;
    private frameCounter: number;

    constructor() {
      super();
      this.instructions = GameStateMachine.instructions;
      this.stages = config.stages;
      this.currentStage = this.frameCounter = 0;
      console.log("Stages and Current Stage");
      console.log(this.stages, this.stages[this.currentStage]);

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
      setup.setAction(GameState.NextStage, <ƒ.General>this.actNextStage);
      setup.setAction(GameState.Victory, <ƒ.General>this.actVictory);
      setup.setAction(GameState.Defeat, <ƒ.General>this.actDefeat);
      setup.setTransition(GameState.Wait, GameState.NextStage, <ƒ.General>GameStateMachine.transitNextStage);
      return setup;
    }

    private static transitDefault(_machine: GameStateMachine): void {
      //nothing?
      console.log("default transition");
    }

    private static actDefault(_machine: GameStateMachine) {
      //not needed?
      console.log("default action", _machine.stateCurrent);
    }

    private static actStart(_machine: GameStateMachine) {
      //spawn enemies
      addEnemy(_machine.stages[_machine.currentStage].enemyCount);
      console.warn("EnemyCount for stage " + _machine.currentStage + 1 + " : " + _machine.stages[_machine.currentStage].enemyCount);
      counterGUI = new GUI(GUIType.EnemyCount, _machine.stages[_machine.currentStage].enemyCount);

      console.log("Gamestate", _machine.stateCurrent, "Action");
      _machine.transit(GameState.Wait);
    }

    // private static actRunning(_machine: GameStateMachine) {
    //   //not needed?
    //   console.log("running action");
    // }

    private static transitNextStage(_machine: GameStateMachine) {
      console.log("GameState Transition from Wait to Next Stage");
      console.log(_machine.stages, _machine.stages.length);

      // if (_machine.stages.length < _machine.currentStage + 1) {
      if (_machine.stages[_machine.currentStage + 1]) {
        _machine.currentStage++;
        _machine.frameCounter = 0;
        let notification: HTMLElement = document.querySelector("div#notification");
        notification.hidden = false;

        addEnemy(_machine.stages[_machine.currentStage].enemyCount);
        console.warn("EnemyCount for stage " + _machine.currentStage + 1 + " : " + _machine.stages[_machine.currentStage].enemyCount);
        counterGUI.enemyCounter = _machine.stages[_machine.currentStage].enemyCount;
      }
      else {
        _machine.frameCounter = -100;
        _machine.transit(GameState.Victory);
      }
    }

    private static actNextStage(_machine: GameStateMachine) {
      if (_machine.frameCounter < 0) {
        _machine.transit(GameState.Victory);
        return;
      }
      _machine.frameCounter++;
      if (_machine.frameCounter > 150) {
        let notification: HTMLElement = document.querySelector("div#notification");
        notification.hidden = true;
        _machine.transit(GameState.Wait);
      }
    }

    private static actVictory(_machine: GameStateMachine) {
      console.log("Action", _machine.stateCurrent);

      let notification: HTMLElement = document.querySelector("div#notification");
      notification.querySelector("h1").innerText = "Your Flame never fades!!  Congratulations, you cleared all stages!";
      notification.hidden = false;

      // Why doesn't it stop?
      ƒ.Loop.stop();
    }

    private static actDefeat(_machine: GameStateMachine) {
      console.log("Action", _machine.stateCurrent);

      let notification: HTMLElement = document.querySelector("div#notification");
      notification.querySelector("h1").innerText = "Your Flame got extinguished! Try again.";
      notification.hidden = false;

      // WHY DOESN'T IT STOOOOOOOOPPP????
      ƒ.Loop.stop();
    }

    private update = (_event: Event): void => { this.act(); }
  }

}