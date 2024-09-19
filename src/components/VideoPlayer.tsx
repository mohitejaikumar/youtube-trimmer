// src/components/VideoPlayer.js

import { BigPlayButton, ControlBar, LoadingSpinner, Player, PlayerReference, PlayerState, PlayToggle, StateListener } from "video-react"
import "video-react/dist/video-react.css"
import {  useEffect, useState } from "react"
import _ from "lodash"

export function VideoPlayer({
    src,
    onPlayerChange ,
    onChange ,
    startTime 
}:{
    src:string,
    onPlayerChange:(x:PlayerReference | null)=>void,
    onChange:(x:PlayerState)=>void,
    startTime:number
}) {
    const [player, setPlayer] = useState<PlayerReference | null>(null)
    const [playerState, setPlayerState] = useState<PlayerState>();

    useEffect(() => {
        if (playerState) {
            onChange(playerState)
        }
    }, [playerState])

    useEffect(() => {
        onPlayerChange(player)

        if (player) {
        
            player.subscribeToStateChange(setPlayerState)
        }
    }, [player])
    // useEffect(()=>{
    //     console.log("HI FROM rerender",src);
    //     if(player){
    //         setPlayerState((prev)=>{
    //             const newState= _.cloneDeep(prev);
    //             if(newState && prev){
    //                 console.log("old SRC" , prev.currentSrc , "new SRC" , src);
    //                 newState.currentSrc = src;
    //             }
    //             return newState;
    //         })
    //         setPlayer((prev)=>{
    //             const newState = _.cloneDeep(prev);
    //             if(newState && prev){
    //                 console.log("old SRC" , prev.currentSrc , "new SRC" , src);
    //                 newState.src = src;
    //             }
    //             return newState;
    //         })
    //     }
    // },[src])

    return (
        <div className="w-[500px] py-4 bg-slate-300 rounded-md px-4">
            { src && 
                <Player
                    ref={(player) => {
                    
                        setPlayer(player)
                    }}
                    src={src}
                    startTime={startTime}
                >
                    
                    <BigPlayButton position="center" />
                    <LoadingSpinner />
                    <ControlBar autoHide={false}>
                        <PlayToggle />
                    </ControlBar>
                </Player>
            }
            
        </div>
    )
}
