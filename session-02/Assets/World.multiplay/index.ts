import { Sandbox, SandboxOptions, SandboxPlayer } from "ZEPETO.Multiplay";
import { Player, Vector3Schema } from "ZEPETO.Multiplay.Schema";

enum MultiplayMessageType {

    // When position is synced
    CharacterTransform = "CharacterTransform",

    // For Animation states
    CharacterState = "CharacterState",
    
    ClientReady = "ClientReady",

    //Game States
    Waiting = "Waiting",

    GameReady = "GameReady",

    GameStart = "GameStart"
};

//Transform position data
type MultiplayMessageCharacterTransform = {
    positionX: number,
    positionY: number,
    positionZ: number,
};

//Character state data
type MultiplayMessageCharacterState = {

    //state id number for translation to enum. 
    characterState: number
};

type MultiplayMessageWaiting = {
    minClients: number
}

type MultiplayMessageGameReady = {
    virusId: string
}


type MultiplayMessageGameStart = {

}

type MultiplayMessageClientReady = {

}

enum GameState {
    
    //Waiting for enough users to begin the game
    Wait,

    //Enough players have been found, game is ready to begin.
    GameReady,

    //All Players loaded. Game is in progress
    GameStart
}

export default class extends Sandbox {
    private gameState = GameState.Wait;
    
    //The minimum number of players required to begin the game. 
    private readonly gameStartCount = 2;

    //To track the current connected players
    private currentPlayerCount: number = 0;

    //Time elapsed since game start. 
    private gameTime: number = 0;
    
    private virusID: string = "";
    
    private openSpawnIndices: boolean[];
    onCreate(options: SandboxOptions) {
        this.openSpawnIndices = new Array(this.maxClients);
        
        // Position Sync Message
        this.onMessage(MultiplayMessageType.CharacterTransform, (client, message: MultiplayMessageCharacterTransform) => {
            // Only continue if the player exists based on the userId
            const userId = client.userId;
            if (!this.state.players.has(userId)) return;

            // Grab the player based on userId
            const player = this.state.players.get(userId);

            // Challenge 2!
            // Instructions: Assign the position received from the client and assign the transform to the player variable above.
            // Hint: What values are contained within the message variable in the parameter to this function?
            //       What type is the "player" variable above? Where does it come from and what variables are contained within its type?
            const position = new Vector3Schema();
            position.x = message.positionX;
            position.y = message.positionY;
            position.z = message.positionZ;

            player.position = position;
        });

        // Character State (Jumping, running etc) sync message
        this.onMessage(MultiplayMessageType.CharacterState, (client, message: MultiplayMessageCharacterState) => {
            const player = this.state.players.get(client.userId);
            player.characterState = message.characterState;
        });

        this.onMessage<MultiplayMessageClientReady>(MultiplayMessageType.ClientReady, (client, message: MultiplayMessageClientReady) => {
            console.log("Player " + client.userId + " is Ready");
            this.currentPlayerCount++;
        });
    }

    //Get the next available spawn transform index.
    GetOpenSpawnIndex(fromIndex : number): number
    {
        let spawnIndex: number = fromIndex;
        for (let i = 0; i < this.maxClients; i++)
        {
            if (!this.openSpawnIndices[spawnIndex]) {break;}
            spawnIndex = (fromIndex + 1) % this.maxClients;
        }
        
        this.openSpawnIndices[spawnIndex] = true;
        return spawnIndex;
    }
    
    onJoin(client: SandboxPlayer) {
        const userId = client.userId;
        const player = new Player();
        
        // Apply the schema userID value to the player object. 
        player.userId = userId;

        //Get the next available spawn transform index
        player.spawnIndex = this.GetOpenSpawnIndex(this.state.players.size);
        
        // Apply the schema's position data to our copy
        player.position = new Vector3Schema();

        // Reset position to (0,0,0)
        player.position.x = 0;
        player.position.y = 0;
        player.position.z = 0;
        
        
        //Cache our player to the map. 
        this.state.players.set(userId, player);
        console.log(`Began Waiting.. ${this.state.players.size}/${this.gameStartCount}`);
        
    }

    onLeave(client: SandboxPlayer, consented?: boolean) {
        //Unset the flag for the players spawn transform index
        this.openSpawnIndices[this.state.players.get(client.userId).spawnIndex] = false;
        
        // Delete the player data
        this.state.players.delete(client.userId);
    }

    onTick(deltaTime: number): void {
        this.UpdateWait(deltaTime);
    }

    InitializeWait()
    {
        // Elapsed Time since start
        this.gameTime = 0;
        // Send Waiting state message to clients
        this.SendMessageWaiting();
    }

    InitializeGame()
    {
        this.gameTime = 0;
        
        //Send a message to the clients that the game is beginning. 
        this.SendMessageGameStart();
    }

    UpdateWait(deltaTime: number) {
        // Don't perform any actions if the game state isn't wait. 
        if (this.gameState != GameState.Wait) return;

        // cache the current player count. 
        //this.currentPlayerCount = this.state.players.size;

        // Check if there are enough players to start the game. 
        if (this.currentPlayerCount >= this.gameStartCount) {
            // If the game hasn't yet started, send the gameready state to the clients. 
            if (this.gameTime == 0) this.SendMessageGameReady();

            this.gameTime += deltaTime;

            // Start the game after 4 seconds (4000 milliseconds)
            if (this.gameTime >= 4000) this.SetGameState(GameState.GameStart);
        }
    }

    //apply the given game state
    SetGameState(gameState: GameState) {
        this.gameState = gameState;

        //Initialize the corresponding game state. 
        switch (gameState) {
            case GameState.Wait: this.InitializeWait(); break;
            case GameState.GameStart: this.InitializeGame(); break;
        }
    }

    SendMessageWaiting() {
        const message: MultiplayMessageWaiting = {
            minClients: this.gameStartCount
        };

        //console.log(`Began Waiting.. ${this.state.players.size}/${this.gameStartCount}`);
        console.log("Waiting..");
        this.broadcast(MultiplayMessageType.Waiting, message);
    }

    SendMessageGameReady() {
        
        //Assign the virus player
        let randIndex: number = Math.floor(Math.random() * this.state.players.size);
        let userID = Array.from(this.state.players.keys())[randIndex];
        this.virusID = this.state.players.get(userID).userId;
        
        const message: MultiplayMessageGameReady = {
            virusId: this.virusID
        };

        console.log("Game Ready..");
        console.log(`Player ${message.virusId} is the virus`);
        this.broadcast(MultiplayMessageType.GameReady, message);
    }

    SendMessageGameStart() {
        const message: MultiplayMessageGameStart = {};
        console.log("Game Start..");
        this.broadcast(MultiplayMessageType.GameStart, message);
    }
}
