declare module 'twilio-video' {
  import { EventEmitter } from 'events';

  export interface ConnectOptions {
    name?: string;
    audio?: boolean | MediaTrackConstraints;
    video?: boolean | MediaTrackConstraints;
    tracks?: LocalTrack[];
    dominantSpeaker?: boolean;
  }

  export function connect(token: string, options?: ConnectOptions): Promise<Room>;

  export function createLocalTracks(options?: CreateLocalTracksOptions): Promise<LocalTrack[]>;

  export interface CreateLocalTracksOptions {
    audio?: boolean | MediaTrackConstraints;
    video?: boolean | MediaTrackConstraints;
  }

  export interface Room extends EventEmitter {
    sid: string;
    name: string;
    localParticipant: LocalParticipant;
    participants: Map<string, RemoteParticipant>;
    disconnect(): void;
    on(event: string, handler: (...args: any[]) => void): this;
  }

  export interface Participant extends EventEmitter {
    sid: string;
    identity: string;
    tracks: Map<Track.SID, TrackPublication>;
    on(event: string, handler: (...args: any[]) => void): this;
    on(event: 'trackSubscribed', handler: (track: RemoteTrack) => void): this;
    on(event: 'trackUnsubscribed', handler: (track: RemoteTrack) => void): this;
  }

  export interface RemoteParticipant extends Participant {
    videoTracks: Map<Track.SID, RemoteVideoTrackPublication>;
  }

  export interface LocalParticipant extends Participant {
    publishTrack(track: LocalTrack): Promise<LocalTrackPublication>;
    unpublishTrack(track: LocalTrack): Promise<LocalTrackPublication>;
  }

  export interface TrackPublication {
    trackName: string;
    trackSid: Track.SID;
    track: Track | null;
  }

  export interface RemoteTrackPublication extends TrackPublication {
    isSubscribed: boolean;
    on(event: 'subscribed', handler: (track: RemoteTrack) => void): this;
    on(event: 'unsubscribed', handler: (track: RemoteTrack) => void): this;
  }

  export interface RemoteVideoTrackPublication extends RemoteTrackPublication {
    track: RemoteVideoTrack | null;
  }

  export interface Track {
    sid: Track.SID;
    name: string;
    kind: Track.Kind;
    isEnabled: boolean;
    attach(element?: HTMLMediaElement): HTMLMediaElement;
    detach(element?: HTMLMediaElement): HTMLMediaElement[];
  }

  export interface VideoTrack extends Track {
    dimensions: { width: number; height: number };
  }

  export interface RemoteTrack extends Track {}

  export interface RemoteVideoTrack extends RemoteTrack, VideoTrack {
    sid: Track.SID;
    isEnabled: boolean;
    isSwitchedOff: boolean;
    priority: Track.Priority | null;
  }

  export interface LocalTrack extends Track {
    stop(): void;
  }

  export interface LocalVideoTrack extends LocalTrack, VideoTrack {}

  export namespace Track {
    type Kind = 'audio' | 'video' | 'data';
    type Priority = 'low' | 'standard' | 'high';
    type SID = string;
  }
}