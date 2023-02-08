import { GameObject, ParticleSystem, Quaternion, Transform } from 'UnityEngine';
import {SpawnInfo, ZepetoPlayer, ZepetoPlayers} from 'ZEPETO.Character.Controller';
import { Player } from 'ZEPETO.Multiplay.Schema';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WorldService } from 'ZEPETO.World';
import CharacterController from '../Character/CharacterController';
import Main from '../Main';
import ClientScript from './Multiplay/ClientScript';

export enum PlayerTeam { VIRUS, SURVIVOR, GHOST, NONE }
export default class GameManager extends ZepetoScriptBehaviour {
    @Header("Initialization Objects")
    public spawnLocations : GameObject[];
    
    @Header("Character Components")
    public detectionTrigger: GameObject;
    public bodyPrefab: GameObject;
    public killFX: ParticleSystem;
    
    private spawnCount = 0;
    private virusId : string = "";

    private players : Map<string, CharacterController> = new Map<string, CharacterController>();

    private bodies : Map<string, GameObject> = new Map<string, GameObject>();
    private isLoadingPlayers: boolean = false;
    public Init()
    {
        ZepetoPlayers.instance.OnAddedPlayer.AddListener((userId) => {
            this.AddSpawn(userId);
        });
        
        this.StartCoroutine(this.WaitForPlayersToLoad());
    }
    
    public *WaitForPlayersToLoad()
    {
        this.isLoadingPlayers = true;
        while (!Main.instance.client.IsReady()) { yield; }
        
        let clientCount = Main.instance.client.multiplayRoom.State.players.Count;
        Main.instance.uiMgr.UpdateUIConsole(`Game is Ready to Begin. Waiting for players to load ${this.spawnCount}/${clientCount}`);
        while (this.spawnCount < clientCount) { yield; }
        this.isLoadingPlayers = false;
        Main.instance.uiMgr.UpdateUIConsole(`Game Started!`)
    }

    public GetSpawnTransform(spawnIndex: number): Transform
    {
        return this.spawnLocations[spawnIndex].transform;
    }
    
    public GetPlayerCC(userId: string) : CharacterController
    {
        if (this.players.has(userId))
            return this.players.get(userId);
        
        return null;
    }

    public AddSpawn(userId: string)
    {
        this.spawnCount++;
        let player: ZepetoPlayer = ZepetoPlayers.instance.GetPlayer(userId);
        let cc : CharacterController = player.character.gameObject.AddComponent<CharacterController>();
        cc.Init(Main.instance.client.multiplayPlayers.get(userId));
        this.players.set(userId, cc);
        Main.instance.client.SendMessageClientReady();
    }

    public RemoveSpawn(userId: string)
    {
        if (!this.players.has(userId)) { return; }
        this.spawnCount--;
    }
}
