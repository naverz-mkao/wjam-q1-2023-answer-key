import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Transform } from 'UnityEngine';
import CharacterController from './Character/CharacterController';
import GameManager from './Game Management/GameManager';
import UIManager from './UI/UIManager';
import LobbySystem from './Game Management/LobbySystem';
import {ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import ClientScript from './Game Management/Multiplay/ClientScript';
import {LoadSceneMode, SceneManager } from 'UnityEngine.SceneManagement';

export default class Main extends ZepetoScriptBehaviour {
    public static instance: Main;

    public characterController: CharacterController;
    public gameMgr: GameManager;
    public uiMgr: UIManager;
    public lobby: LobbySystem;
    public client: ClientScript;
    
    public hasEnteredLobby : boolean = false;

    private spawnedIds: string[];

    public static GetInstance(): Main
    {
        let gameObject = GameObject.Find("Main");
        if (gameObject != null)
            return gameObject.GetComponent<Main>();
        else
            return new Main();
    }

    public Awake()
    {
        Main.instance = this;
        this.gameMgr = this.GetComponentInChildren<GameManager>();
        this.uiMgr = this.GetComponentInChildren<UIManager>();
        this.client = this.GetComponentInChildren<ClientScript>();
        this.lobby = this.GetComponentInChildren<LobbySystem>();
    }

    public Start()
    {
        this.spawnedIds = new Array<string>();
        this.StartCoroutine(this.InitializeAll());
    }

    public *InitializeAll()  
    {
        this.client?.Init();
        this.gameMgr?.Init();
        this.uiMgr?.Init();
        this.InitializePlayers();
    }

    public InitializePlayers()
    {
        ZepetoPlayers.instance.OnAddedPlayer.AddListener((userId) => {
            this.AddSpawn(userId);
        });
    }
    
    public LocalCharacter(): CharacterController
    {
        return this.characterController;
    }

    public AddSpawn(userId: string)
    {
        if (this.spawnedIds.includes(userId)) { return; }
        this.spawnedIds.push(userId);
        this.gameMgr?.AddSpawn(userId);
    }

    public RemoveSpawn(userId: string)
    {
        this.gameMgr?.RemoveSpawn();
    }

    public GetSpawnTransform(spawnIndex: number): Transform
    {
        return this.gameMgr?.GetSpawnTransform(spawnIndex);
    }
    
    public InitializeWithVirus(virusId: string)
    {
        if (this.gameMgr == undefined) { return; }
        console.log(`Setting Virus with id ${virusId}`);
        this.gameMgr.RespawnPlayers(Array.from<string>(Main.instance.client.multiplayPlayers.keys()));
        this.StartCoroutine(this.gameMgr.InitializeWithVirus(virusId));
    }
}
