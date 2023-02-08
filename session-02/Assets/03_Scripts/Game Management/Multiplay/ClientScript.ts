import { GameObject, Quaternion, Vector3, WaitForSeconds, Transform } from 'UnityEngine';
import { CharacterState, SpawnInfo, ZepetoCharacter, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Room } from 'ZEPETO.Multiplay';
import { Player, State } from 'ZEPETO.Multiplay.Schema';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WorldService, ZepetoWorldMultiplay } from 'ZEPETO.World';
import Main from '../../Main';
import ClientMessageSender from './ClientMessageSender';

export enum MultiplayMessageType {

    // When position is synced
    CharacterTransform = "CharacterTransform",

    // For Animation states
    CharacterState = "CharacterState",
    
    //Let Server Know Client is fully loaded
    ClientReady = "ClientReady",

    //Game States
    Waiting = "Waiting",

    GameReady = "GameReady",

    GameStart = "GameStart"
}

//Transform position data
export type MultiplayMessageCharacterTransform = {
    positionX: number,
    positionY: number,
    positionZ: number,
}

//Character state data
export type MultiplayMessageCharacterState = {

    //state id number for translation to enum. 
    characterState: number
}

type MultiplayMessageWaiting = {
    minClients: number
}

type MultiplayMessageGameReady = {
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

export default class ClientScript extends ZepetoScriptBehaviour {
    private static instance: ClientScript;
    static GetInstance(): ClientScript {
        if (!ClientScript.instance) {
            const targetObj = GameObject.Find("Client");
            if (targetObj) ClientScript.instance = targetObj.GetComponent<ClientScript>();
        }
        return ClientScript.instance;
    }

    public multiplay: ZepetoWorldMultiplay;

    public multiplayRoom: Room;

    private minClients: number = 2;

    //Map of the players coming from the multiplay server. 
    public multiplayPlayers: Map<string, Player> = new Map<string, Player>();

    public objZepetoPlayers: ZepetoPlayers;
    
    public messageSender: ClientMessageSender = new ClientMessageSender();
    
    private gameState: GameState;
    public Awake() {
        this.messageSender = new ClientMessageSender();
        this.messageSender.Init(this);
        this.gameState = GameState.Wait;
    }
    
    Start() { 
        //Cache the room in the Callback when the server creates a room object. 
        this.multiplay.RoomCreated += (room: Room) => {
            this.multiplayRoom = room;
            
        };

        //Callback for when the room is joined. 
        this.multiplay.RoomJoined += (room: Room) => {
            //Called each time the room state variables are altered
            room.OnStateChange += this.OnStateChange;

            this.InitializeMessages();
        }
    }
    
    public InitializeMessages()
    {
        this.multiplayRoom.AddMessageHandler(MultiplayMessageType.Waiting, (message: MultiplayMessageWaiting) => {
            this.minClients = message.minClients;
            this.gameState = GameState.Wait;
            Main.instance.uiMgr.UpdateUIConsole(`Waiting For ${this.multiplayPlayers.size}/${this.minClients} Clients to connect`);
        });

        this.multiplayRoom.AddMessageHandler(MultiplayMessageType.GameReady, (message: MultiplayMessageGameReady) => {
            Main.instance.uiMgr.UpdateUIConsole("Game is Ready!");
            console.error("Recieved Game Ready Message");
            this.gameState = GameState.GameReady;
        });

        this.multiplayRoom.AddMessageHandler(MultiplayMessageType.GameStart, (message => {
            this.gameState = GameState.GameStart;
        }));
    }

    public Init()
    {
        
    }
    
    public IsReady() : boolean
    {
        return this.gameState == GameState.GameReady;    
    }
    
    public GetPlayer(userId: string) : Player
    {
        return this.multiplayRoom.State.players.get_Item(userId);
    }

    private OnStateChange(state: State, isFirst: boolean) {
        // Called for the first state change only
        if (isFirst) {
            // Apply sync logic for player if they already exist. 
            state.players.ForEach((userId, player) => { this.OnPlayerAdd(player, userId) });

            // Register Player Add/Remove events 
            state.players.add_OnAdd((player, userId) => { this.OnPlayerAdd(player, userId) });
            state.players.add_OnRemove((player, userId) => { this.OnPlayerRemove(player, userId) });

            this.InitializeCharacter(state);
        }
    }

    private OnPlayerAdd(player: Player, userId: string) {
        if (this.multiplayPlayers.has(userId)) return;

        // Cache the player to our map 
        this.multiplayPlayers.set(userId, player);


        // If the added player id matches the world service id, we know this is the local player. 
        const isLocal = WorldService.userId === userId;

        if (this.gameState == GameState.Wait)
        {
            Main.instance.uiMgr.UpdateUIConsole(`Waiting For ${this.multiplayPlayers.size}/${this.minClients} Clients to connect`);
        }

        //Create spawn info for our new character. 
        const spawnInfo = new SpawnInfo();
        const transformInfo : Transform = Main.instance.GetSpawnTransform(player.spawnIndex);

        // Challenge 3!
        // Instructions: Using the SpawnInfo variable and the transformInfo variable created for you, assign the spawnInfo variable's 
        // position and rotation variables to the transformInfo's transform/rotation values, then create a player using that info. 
        // Hint: What type is transformInfo and what values do we want from that variable? Whats contained in our spawnInfo variable?
        //       Where can we find the guide to create a player using the userId?
        spawnInfo.position = transformInfo.position;
        spawnInfo.rotation = transformInfo.rotation;

        // Instantiate character with the above settings. 
        ZepetoPlayers.instance.CreatePlayerWithUserId(userId, userId, spawnInfo, isLocal);
    }

    
    private OnPlayerRemove(player: Player, userId: string) {
        if (!this.multiplayPlayers.has(userId)) return;
        ZepetoPlayers.instance.RemovePlayer(userId);
        Main.instance.gameMgr.RemoveSpawn(userId);
        this.multiplayPlayers.delete(userId);

        if (this.gameState == GameState.Wait)
        {
            Main.instance.uiMgr.UpdateUIConsole(`Waiting For ${this.multiplayPlayers.size}/${this.minClients} Clients to connect`);
        }
    }

    private InitializeCharacter(state: State) {
        // Callback when the localplayer is fully loaded into the scene.
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            // cache the player and userIds
            const zepetoPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
            const userId = WorldService.userId;

            zepetoPlayer.character.gameObject.layer = 5;

            // Change the character's name to the userID
            zepetoPlayer.character.name = userId;

            // Send a message to the server every time the character state is altered. 
            zepetoPlayer.character.OnChangedState.AddListener((current, previous) => {
                this.SendMessageCharacterState(current);
            });

            // Check the character transform positions every 0.1 seconds and update. 
            this.StartCoroutine(this.SendMessageCharacterTransformLoop(0.1));
        });

        // Callback when the player is fully loaded into the scene. 
        ZepetoPlayers.instance.OnAddedPlayer.AddListener((userId: string) => {
            //Cache the player by userId
            const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(userId);

            // Set the character object's name to the userId
            zepetoPlayer.character.name = userId;

            //Grab the player instance from the server schema map based on the userId
            const player: Player = this.multiplayRoom.State.players.get_Item(userId);

            // Add to the OnChange Schema Type Callback Message
            player.position.OnChange += () => {

                // Only sync for everyone but the local player
                if (zepetoPlayer.isLocalPlayer == false) {

                    // Cache the postion values. 
                    const x = player.position.x;
                    const y = player.position.y;
                    const z = player.position.z;
                    const position = new Vector3(x, y, z);

                    // Directly apply the server position if the position deviates past a certain range (Handle sync issues)
                    if (Vector3.Distance(position, zepetoPlayer.character.transform.position) > 7) {
                        zepetoPlayer.character.transform.position = position;
                    }

                    // Move the character to the target position. 
                    zepetoPlayer.character.MoveToPosition(position);

                    //Jump if the character state has changed to jump. 
                    if (player.characterState === CharacterState.JumpIdle || player.characterState === CharacterState.JumpMove)
                        zepetoPlayer.character.Jump();
                }
            }
        });
    }

    //Message Sending Functions
    public SendMessageCharacterState(characterState: CharacterState) {
        // Create the character state message body. 
        const message: MultiplayMessageCharacterState = {
            characterState: characterState
        }

        // Send the character state. 
        this.multiplayRoom.Send(MultiplayMessageType.CharacterState, message);
    }

    public *SendMessageCharacterTransformLoop(tick: number) {
        while (true) {

            // Wait For the designated amount of time (tick)
            yield new WaitForSeconds(tick);

            // Only run if the multiplay room instance exists and the room is connected. 
            if (this.multiplayRoom != null && this.multiplayRoom.IsConnected) {

                // Cache the userId. 
                const userId = WorldService.userId;

                // Only run if the player exists in the zepeto players map. 
                if (ZepetoPlayers.instance.HasPlayer(userId)) {

                    //Cache the character controller. 
                    const character = ZepetoPlayers.instance.GetPlayer(userId).character;

                    // Send the character transform update message if not idling. (Send when character moves/jumps)
                    if (character.CurrentState != CharacterState.Idle)
                        this.SendMessageCharacterTransform(character.transform);
                }
            }
        }
    }

    public SendMessageCharacterTransform(transform: Transform) {
        //Cache the local transform position. 
        const position = transform.localPosition;

        // Challenge 1!
        // Instructions: Create the message to send the transform message up to the server. 
        // Hint: Can we use the MultiplayMessageCharacterTransform type? 
        //       Where in the guides can we find how to send a message to the server?
        
        // Create the message body below.
        
        // Then, send the message to the server with the "Send" function. 
        // Create the message body 
        const message: MultiplayMessageCharacterTransform = {
            positionX: position.x,
            positionY: position.y,
            positionZ: position.z
        }

        // Send the message to the server. 
        this.multiplayRoom.Send(MultiplayMessageType.CharacterTransform, message);
        
    }

    public SendMessageClientReady()
    {
        const clientCount = this.multiplayPlayers.size;
        let message : MultiplayMessageClientReady = {}

        this.multiplayRoom.Send(MultiplayMessageType.ClientReady, message);
    }
}
