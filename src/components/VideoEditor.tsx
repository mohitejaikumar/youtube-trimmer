

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"
import { LegacyRef, useCallback, useEffect, useRef, useState } from "react"
import { Button, Slider, Spin } from "antd"
import { VideoPlayer } from "./VideoPlayer"
import { sliderValueToVideoTime } from "@/helpers/sliderConverter"
import { PlayerReference, PlayerState, StateListener } from "video-react"
import ReactPlayer from "react-player"

const ffmpeg = createFFmpeg({ log: true })

function VideoEditor({
    videoURL
}:{
    videoURL:string
}) {
    const [ffmpegLoaded, setFFmpegLoaded] = useState(false)
    
    const [videoPlayerState, setVideoPlayerState] = useState<PlayerState>()
    const [videoPlayer, setVideoPlayer] = useState<PlayerReference | null>(null)
    const [sliderValues, setSliderValues] = useState([0, 100])
    const [processing, setProcessing] = useState(false)
    const [finalVideoURL, setFinalVideoURL] = useState<string | null>(null)
    

    useEffect(() => {
        // loading ffmpeg on startup
        ffmpeg.load().then(() => {
            setFFmpegLoaded(true)
        })
    }, [])

    useEffect(() => {
        const min = sliderValues[0]
        console.log(videoURL);
        // when the slider values are updated, updating the
        // video time
        if (min !== undefined && videoPlayerState && videoPlayer) {
            videoPlayer.seek(sliderValueToVideoTime(videoPlayerState.duration, min))
        }
    }, [sliderValues])

    useEffect(() => {
        if (videoPlayer && videoPlayerState) {
            // allowing users to watch only the portion of
            // the video selected by the slider
            const [min, max] = sliderValues

            const minTime = sliderValueToVideoTime(videoPlayerState.duration, min)
            const maxTime = sliderValueToVideoTime(videoPlayerState.duration, max)

            if (videoPlayerState.currentTime < minTime) {
                videoPlayer.seek(minTime)
            }
            if (videoPlayerState.currentTime > maxTime) {
                // looping logic
                videoPlayer.seek(minTime)
            }
        }
    }, [videoPlayerState])

    useEffect(() => {
        // when the current videoFile is removed,
        // restoring the default state
        if (!videoURL) {
            console.log("Resetting...");
            setVideoPlayerState(undefined)
            setSliderValues([0, 100])
            setVideoPlayerState(undefined)
        }
    }, [videoURL])

    const onCrop = useCallback( async ()=>{

        if(!videoPlayerState){
            return ;
        }
        const [min, max] = sliderValues
        const minTime = sliderValueToVideoTime(videoPlayerState.duration, min)
        const maxTime = sliderValueToVideoTime(videoPlayerState.duration, max)
        setProcessing(true);
        // Load the uploaded video file into FFmpeg's virtual filesystem
        ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoURL));

        // Run the FFmpeg command to trim the video
        await ffmpeg.run(
            '-i', 'input.mp4',
            '-ss', `${minTime}`,      // start time
            '-to', `${maxTime}`,        // end time
            '-c', 'copy',               // copy codec (no re-encoding)
            'output.mp4'
        );

        // Read the output video file from FFmpeg's virtual filesystem
        const data = ffmpeg.FS('readFile', 'output.mp4');
        

        // Convert the output to a Blob for download or display
        const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
        const videoBlobURL = URL.createObjectURL(videoBlob);
        setFinalVideoURL(videoBlobURL);
        setProcessing(false);
    } , [ videoPlayerState])

    function onDownload(){
        const a = document.createElement('a');
        a.href = finalVideoURL || "";
        a.download = "youtube-trimmed.mp4";
        a.click();

    }

    return (
        <div>
            <Spin spinning={processing || !ffmpegLoaded} tip={!ffmpegLoaded ? "Waiting for FFmpeg to load..." : "Processing..."}>
                <div className="flex gap-8 justify-center">
                    
                    <div>
                        {videoURL &&
                            <>  
                                <VideoPlayer
                                    src={videoURL}
                                    onPlayerChange={(videoPlayer) => {
                                        setVideoPlayer(videoPlayer)
                                    }}
                                    onChange={(videoPlayerState) => {
                                        setVideoPlayerState(videoPlayerState)
                                    }}
                                    startTime={0}
                                />
                                <div className="bg-slate-300 text-black px-4 py-2 rounded-lg mt-10">
                                    <h3 className=" font-bold ">Trim Slider</h3>
                                    <Slider
                                        disabled={!videoPlayerState}
                                        value={sliderValues}
                                        range={true}
                                        onChange={(values) => {
                                            setSliderValues(values)
                                        }}
                                        style={{backgroundColor:"gray" , borderRadius:"10px"}}
                                        tooltip={{
                                            formatter: null,
                                            color:'black',
                                        }}
                                    />
                                    <div  onClick={onCrop} className="text-white bg-red-600 w-fit px-4 py-2 mt-5 rounded-md cursor-pointer font-semibold"  >Trim</div>
                                </div>
                            </>
                        }
                    </div>
                    { finalVideoURL && 
                        <>
                        <div className=" bg-slate-300 rounded-md px-4 py-4 flex flex-col items-center justify-center">
                            <ReactPlayer  url={finalVideoURL} controls />
                            <div  onClick={onDownload} className="text-white bg-red-600 w-fit px-4 py-2 mt-10 rounded-md cursor-pointer font-semibold ">Download</div>
                        </div>
                        </>
                    }
                </div>
                
            </Spin>
        </div>
    )
}

export default VideoEditor
