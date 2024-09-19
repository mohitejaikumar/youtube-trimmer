"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VideoEditor from "@/components/VideoEditor";
import { Spin } from "antd";
import { Scissors, Play, Pause, Youtube } from "lucide-react"
import { useState } from "react";

export default function Home() {

  const [url, setUrl] = useState("");
  const [videoURL , setVideoURL] = useState<string|null>(null);
  const [processing, setProcessing] = useState(false);

  async function onSubmit(){
    console.log(url);

    setProcessing(true);

    const response = await fetch('http://localhost:8080/download',{
      method: 'POST',
      body: JSON.stringify({youtubeUrl: url}),
       // Adding headers to the request 
      headers: { 
          "Content-type": "application/json; charset=UTF-8"
      } 
    });

    if (!response.ok) {
        console.error('Error fetching the file:', response.statusText);
        return;
    }
    if(!response.body ) {
      return;
    }
    console.log("Start stream .....")
    // Access the ReadableStream
    const reader = response.body.getReader();
    //@ts-ignore
    const contentLength = +response.headers.get('Content-Length');
    let receivedLength = 0; // Track how much data we've received so far
    const chunks = []; // Store received chunks
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            console.log('File download complete');
            break;
        }

        chunks.push(value);
        receivedLength += value.length;

        // Optional: Show progress
        // console.log(`Received ${receivedLength} of ${contentLength}`);
    }

    const blob = new Blob(chunks);
    const blobURL = URL.createObjectURL(blob);
    setVideoURL(()=>blobURL);
    // console.log(blobURL);
    setProcessing(false);
    
  }


  return (
    
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-red-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scissors className="h-8 w-8" />
              <span className="text-2xl font-bold">YT Trimmer</span>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Trim Your YouTube Videos with Ease
          </h1>
          <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
            Cut, clip, and perfect your YouTube content in seconds. Our intuitive trimmer makes video editing a breeze.
          </p>
          <Spin spinning={processing} tip={"Downloading..."} style={{padding:"3px 3px"}}>
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-2 mb-4">
              <Youtube className="h-6 w-6 text-red-600" />
              <Input type="text" placeholder="Paste your YouTube URL here" className="flex-grow" onChange={(e) => setUrl(e.target.value)} />
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={onSubmit}>
              Submit
            </Button>
          </div>
          <div className="mt-5">
            { videoURL && 
              
              <VideoEditor videoURL={videoURL} />
            }
          </div>
          </Spin>
        </section>

        <section className="bg-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                  <Youtube className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Paste URL</h3>
                <p className="text-gray-600">Copy and paste your YouTube video URL</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                  <Scissors className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Trim Video</h3>
                <p className="text-gray-600">Select start and end points to trim</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                  <Play className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Download</h3>
                <p className="text-gray-600">Download your trimmed video</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 YT Trimmer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
