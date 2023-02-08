import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Transform } from 'UnityEngine';
import CharacterController from './Character/CharacterController';
import GameManager from './Game Management/GameManager';
import UIManager from './UI/UIManager';
import {ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import ClientScript from './Game Management/Multiplay/ClientScript';

export default class Main extends ZepetoScriptBehaviour {
    public static instance: Main;

    public characterController: CharacterController;
    public gameMgr: GameManager;
    public uiMgr: UIManager;
    public client: ClientScript;
    
    public hasEnteredLobby : boolean = false;


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
    }

    public Start()
    {
        this.InitializeAll();
    }

    public InitializeAll()  
    {
        this.client?.Init();
        this.gameMgr?.Init();
    }

    public GetSpawnTransform(spawnIndex: number): Transform
    {
        return this.gameMgr?.GetSpawnTransform(spawnIndex);
    }
}
