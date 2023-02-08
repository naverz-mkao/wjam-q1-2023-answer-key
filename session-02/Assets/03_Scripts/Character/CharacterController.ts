import {Camera, Canvas, Debug, GameObject, Input, KeyCode, LayerMask, Material, Quaternion, Resources, Vector2, Vector3 } from 'UnityEngine';
import {LocalPlayer, ZepetoCamera, ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Player } from 'ZEPETO.Multiplay.Schema';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WorldService } from 'ZEPETO.World';
import { PlayerTeam } from '../Game Management/GameManager';
import Main from '../Main';

export default class CharacterController extends ZepetoScriptBehaviour {
    public playerInfo : Player;
    
    public zptPlayer: ZepetoPlayer;
    
    private targetPlayers: Map<string, string> = new Map<string, string>();

    public localCharacterLight: GameObject;
    
    public Init(playerInfo: Player)
    {
        this.playerInfo = playerInfo;
        this.zptPlayer = ZepetoPlayers.instance.GetPlayer(this.playerInfo.userId);

        //NOTE: Might Potentially be an issue if the local player is already added by this point. 
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.SetCamera();

            Main.instance.characterController = this;
            
            this.localCharacterLight = Resources.Load<GameObject>("CharacterLight");

            this.AddLight(this.gameObject);

            this.AddRenderCamera();
        });
    }

    public AddLight(parent: GameObject)
    {
        const characterLight: GameObject = GameObject.Instantiate(this.localCharacterLight, this.transform.position, Quaternion.identity) as GameObject;
        characterLight.transform.parent = parent.transform;
    }

    public AddRenderCamera()
    {
        GameObject.Find("UICanvas").GetComponent<Canvas>().worldCamera = GameObject.Find("ZepetoCamera").GetComponent<Camera>();
    }
    
    public Update()
    {
        if (Input.GetKeyDown(KeyCode.T))
        {
            console.error(ZepetoPlayers.instance.LocalPlayer.zepetoCamera.gameObject.name);
        }
    }
    
    public IsLocal(): boolean
    {
        return (this.playerInfo.userId == WorldService.userId);
    }
    
    public GetNearestTarget() : string
    {
        if (this.targetPlayers.size == 0) { return ""; }
        
        let closestDist : number = Infinity;
        let finalID: string = "";
        this.targetPlayers.forEach((value, key) => {
            let cc : CharacterController = Main.instance.gameMgr.GetPlayerCC(value);
            let dist: number = Vector3.Distance(this.transform.position, cc.transform.position);
            if (dist < closestDist)
            {
                closestDist = dist;
                finalID  = cc.playerInfo.userId;
            }
        });
        
        return finalID;
    }
    
    public SetCamera()
    {
        let localPlayer : LocalPlayer = ZepetoPlayers.instance.LocalPlayer;
        let cam : ZepetoCamera = localPlayer.zepetoCamera;
        
        //Camera Settings
        cam.cameraParent.rotation = Quaternion.Euler(0, 45, 0);
    }
}