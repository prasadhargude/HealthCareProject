'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, PhoneIcon, MessageSquareIcon, UsersIcon, SettingsIcon, AlertCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import Script from 'next/script'

// Define interfaces for type safety
interface Participant {
  id: string;
  name: string;
  isLocal: boolean;
  webcamOn: boolean;
  micOn: boolean;
  webcamStream?: MediaStream;
  micStream?: MediaStream;
}

interface Message {
  sender: string;
  text: string;
}

interface Consultation {
  doctorName?: string;
  patientName: string;
  date: string;
  time: string;
  specialty: string;
  symptoms?: string;
  notes?: string;
}

export default function MeetingRoom({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [isVideoSDKLoaded, setIsVideoSDKLoaded] = useState(false)
  const [meeting, setMeeting] = useState<any>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [activeTab, setActiveTab] = useState("video")
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  
  const router = useRouter()
  const meetingId = params.id

  // References for video elements and chat container
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})

  // Create a callback for setting video refs
  const setVideoRef = useCallback((participantId: string) => (node: HTMLVideoElement | null) => {
    remoteVideoRefs.current[participantId] = node;
  }, []);

  useEffect(() => {
    if (!meetingId) return;  // ✅ Avoids undefined meetingId errors
  
    const fetchConsultation = async () => {
      try {
        const response = await fetch(`/api/consultation?meetingId=${meetingId}`);
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch consultation details' }));
          throw new Error(errorData.error || 'Failed to fetch consultation details');
        }
        
        const consultationData = await response.json();
        
        if (!consultationData) {
          setError('Consultation not found');
          setIsLoading(false);
          return;
        }
        
        setConsultation(consultationData);
      } catch (error: any) {
        console.error('Error fetching consultation:', error);
        setError(error.message || 'Failed to fetch consultation details');
      }
    }
    
    fetchConsultation();
  }, [meetingId]);

  const initializeMeeting = useCallback(async () => {
    try {
      // @ts-ignore - VideoSDK is loaded via script
      const { VideoSDK } = window;

      if (!VideoSDK) {
        throw new Error("VideoSDK not loaded");
      }
      
      // Fetch token from API instead of using environment variable directly
      const tokenResponse = await fetch('/api/video-consultations/token');
      if (!tokenResponse.ok) {
        throw new Error("Failed to get video token");
      }
      
      const tokenData = await tokenResponse.json();
      const token = tokenData.token;
      
      if (!token) {
        throw new Error("Invalid video token");
      }
      
      // Initialize VideoSDK with token
      VideoSDK.config(token);

      // Get user name from localStorage or use default
      const userName = localStorage.getItem('userName') || (consultation?.patientName || 'User');

      // Create meeting instance
      const meetingInstance = VideoSDK.initMeeting({
        meetingId,
        name: userName,
        micEnabled: true,
        webcamEnabled: true,
        maxResolution: 'hd'
      });

      // Set up event listeners
      meetingInstance.on("meeting-joined", () => {
        console.log("Meeting joined successfully");
        setIsLoading(false);
        
        // Add local participant
        const localParticipant: Participant = {
          id: meetingInstance.localParticipant.id,
          name: userName,
          isLocal: true,
          webcamOn: true,
          micOn: true,
          webcamStream: meetingInstance.localParticipant.webcamStream,
          micStream: meetingInstance.localParticipant.micStream
        };
        
        setParticipants([localParticipant]);
        
        // Set up local video
        if (localVideoRef.current && localParticipant.webcamStream) {
          localVideoRef.current.srcObject = localParticipant.webcamStream;
        }
      });
      
      meetingInstance.on("participant-joined", (participant: any) => {
        console.log("Participant joined:", participant.id);
        
        const newParticipant: Participant = {
          id: participant.id,
          name: participant.displayName || "Participant",
          isLocal: false,
          webcamOn: participant.webcamOn,
          micOn: participant.micOn,
          webcamStream: participant.webcamStream,
          micStream: participant.micStream
        };
        
        setParticipants(prev => [...prev, newParticipant]); 

        // Set up remote video when stream becomes available
        participant.on("stream-enabled", (stream: any) => {
          if (stream.kind === "video") {
            setParticipants(prev => 
              prev.map(p => p.id === participant.id ? {
                ...p,
                webcamOn: true,
                webcamStream: participant.webcamStream
              } : p)
            );
            
            // Use a setTimeout to ensure the ref is available after state update
            setTimeout(() => {
              if (remoteVideoRefs.current[participant.id] && participant.webcamStream) {
                remoteVideoRefs.current[participant.id]!.srcObject = participant.webcamStream;
              }
            }, 0);
          } else if (stream.kind === "audio") {
            setParticipants(prev => 
              prev.map(p => p.id === participant.id ? {
                ...p,
                micOn: true,
                micStream: participant.micStream
              } : p)
            );
          }
        });

        participant.on("stream-disabled", (stream: any) => {
          if (stream.kind === "video") {
            setParticipants(prev => 
              prev.map(p => p.id === participant.id ? {
                ...p,
                webcamOn: false
              } : p)
            );
          } else if (stream.kind === "audio") {
            setParticipants(prev => 
              prev.map(p => p.id === participant.id ? {
                ...p,
                micOn: false
              } : p)
            );
          }
        });
      });
      
      meetingInstance.on("participant-left", (participant: any) => {
        console.log("Participant left:", participant.id);
        setParticipants(prev => prev.filter(p => p.id !== participant.id));
      });
      
      meetingInstance.on("meeting-left", () => {
        console.log("Meeting left");
        router.push("/my-consultations");
      });
      
      // Set up pubsub for chat messages
      meetingInstance.pubSub.subscribe("CHAT", (data: any) => {
        const sender = participants.find(p => p.id === data.senderId)?.name || data.senderName || "Participant";
        
        setMessages(prev => [
          ...prev,
          {
            sender: sender,
            text: data.message
          }
        ]);
      });

      // Store meeting instance first
      setMeeting(meetingInstance);

      // Now join the meeting
      try {
        meetingInstance.join();
        console.log("Joining meeting...");
      } catch (joinError) {
        console.error("Error joining meeting:", joinError);
        setError("Failed to join the meeting. Please refresh and try again.");
        setIsLoading(false);
      }

    } catch (error) {
      console.error("Error initializing meeting:", error);
      setError("Failed to initialize video call. Please refresh the page and try again.");
      setIsLoading(false);
    }
  }, [meetingId, consultation, participants, router]);

  useEffect(() => {
    if (isVideoSDKLoaded) {
      initializeMeeting();
    }

    // Cleanup function
    return () => {
      if (meeting) {
        meeting.leave();
      }
    };
  }, [isVideoSDKLoaded, initializeMeeting, meeting]);
  
  useEffect(() => {
    // Scroll to bottom of chat when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleMic = () => {
    if (!meeting) return;

    if (isMicOn) {
      meeting.localParticipant.disableMic();
    } else {
      meeting.localParticipant.enableMic();
    }

    setIsMicOn(!isMicOn);
  };

  const toggleVideo = () => {
    if (!meeting) return;

    if (isVideoOn) {
      meeting.localParticipant.disableWebcam();
    } else {
      meeting.localParticipant.enableWebcam();
    }

    setIsVideoOn(!isVideoOn);
  };

  const endCall = () => {
    if (meeting) {
      meeting.leave();
    }
    router.push("/my-consultations");
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !meeting) return;

    try {
      // Send message to all participants
      meeting.pubSub.publish("CHAT", {
        message: messageInput,
        senderName: "You"
      });

      // Add message to local state
      setMessages(prev => [
        ...prev,
        {
          sender: "You",
          text: messageInput
        }
      ]);

      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show an error toast or message
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Initializing your meeting...</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <Script
        src="https://sdk.videosdk.live/js-sdk/0.0.67/videosdk.js"
        onLoad={() => {
          console.log("VideoSDK script loaded");
          setIsVideoSDKLoaded(true);
        }}
        onError={() => {
          console.error("Failed to load VideoSDK script");
          setError("Failed to load VideoSDK. Please check your internet connection and try again.");
        }}
        strategy="afterInteractive"
      />

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <AlertCircleIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                <p className="text-sm text-yellow-700 mt-1">{error}</p>
                <p className="text-sm text-yellow-700 mt-1">
                  You can still join the meeting, but some features may be limited.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-3/4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {consultation?.doctorName
                      ? `Consultation with Dr. ${consultation.doctorName}`
                      : "Video Consultation"}
                  </h1>
                  <TabsList>
                    <TabsTrigger value="video">Video</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="participants">Participants</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="video" className="mt-0">
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
                      {/* Local participant video */}
                      <div className="relative h-full bg-gray-800 rounded-lg overflow-hidden">
                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 flex justify-between items-center">
                          <span className="text-white text-sm">You</span>
                          <div className="flex space-x-1">
                            {!isMicOn && <MicOffIcon className="h-4 w-4 text-red-500" />}
                            {!isVideoOn && <VideoOffIcon className="h-4 w-4 text-red-500" />}
                          </div>
                        </div>
                      </div>

                      {/* Remote participants videos */}
                      {participants.filter(p => !p.isLocal).length === 0 ? (
                        <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
                          <div className="text-center text-gray-400">
                            <UsersIcon className="h-12 w-12 mx-auto mb-2" />
                            <p>Waiting for others to join...</p>
                          </div>
                        </div>
                      ) : (
                        participants
                          .filter(p => !p.isLocal)
                          .map(participant => (
                            <div
                              key={participant.id}
                              className="relative h-full bg-gray-800 rounded-lg overflow-hidden"
                            >
                              <video
                                ref={setVideoRef(participant.id)}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 flex justify-between items-center">
                                <span className="text-white text-sm">{participant.name}</span>
                                <div className="flex space-x-1">
                                  {!participant.micOn && <MicOffIcon className="h-4 w-4 text-red-500" />}
                                  {!participant.webcamOn && <VideoOffIcon className="h-4 w-4 text-red-500" />}
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`rounded-full h-12 w-12 ${!isMicOn ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400" : ""}`}
                      onClick={toggleMic}
                    >
                      {isMicOn ? <MicIcon className="h-5 w-5" /> : <MicOffIcon className="h-5 w-5" />}
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className={`rounded-full h-12 w-12 ${!isVideoOn ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400" : ""}`}
                      onClick={toggleVideo}
                    >
                      {isVideoOn ? <VideoIcon className="h-5 w-5" /> : <VideoOffIcon className="h-5 w-5" />}
                    </Button>

                    <Button variant="destructive" size="icon" className="rounded-full h-12 w-12" onClick={endCall}>
                      <PhoneIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="chat" className="mt-0">
                  <Card>
                    <CardContent className="p-4">
                      <div
                        ref={chatContainerRef}
                        className="h-[60vh] overflow-y-auto mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md"
                      >
                        {messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <MessageSquareIcon className="h-12 w-12 mb-2" />
                            <p>No messages yet</p>
                          </div>
                        ) : (
                          messages.map((msg, index) => (
                            <div key={index} className="mb-4">
                              <p className="font-medium text-sm text-gray-600 dark:text-gray-400">{msg.sender}</p>
                              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                                <p>{msg.text}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your message..."
                          className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        />
                        <Button onClick={sendMessage} className="rounded-l-none bg-green-600 hover:bg-green-700">
                          Send
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="participants" className="mt-0">
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">Participants ({participants.length})</h3>
                        </div>

                        <div className="space-y-2">
                          {participants.map((participant) => (
                            <div
                              key={participant.id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                            >
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                                  <span className="font-medium text-green-600 dark:text-green-400">
                                    {participant.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{participant.name}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {participant.isLocal ? "You" : "Remote Participant"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:w-1/4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium mb-4">Consultation Details</h3>

                  {consultation ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                        <p className="font-medium">{consultation.date}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                        <p className="font-medium">{consultation.time}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Specialty</p>
                        <p className="font-medium">{consultation.specialty}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Doctor</p>
                        <p className="font-medium">{consultation.doctorName || "Doctor"}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Patient</p>
                        <p className="font-medium">{consultation.patientName}</p>
                      </div>

                      {consultation.symptoms && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Symptoms</p>
                          <p className="font-medium">{consultation.symptoms}</p>
                        </div>
                      )}

                      {consultation.notes && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                          <p className="font-medium">{consultation.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  )}

                  <div className="mt-6">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center"
                      onClick={() => setActiveTab("video")}
                    >
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Back to Video
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Add this to make TypeScript happy with the VideoSDK global
declare global {
  interface Window {
    VideoSDK: any;
  }
}