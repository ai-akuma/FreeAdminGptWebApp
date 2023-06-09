import { YoutubeVideo } from "./video/youtubevideo.model";
import { VideoMetadata } from "./video/videometadata.model";
import { VideoNiche } from "./autocreate/videoniche.model";
import { VideoDuration } from "./autocreate/videoduration.model";

export interface YoutubeVideoPage {
    id?: string;
    createdDate: string;
    createdFrom: string;

    youtubeVideo?: YoutubeVideo;
    metadata?: VideoMetadata;
    structuredScript?: Map<string, string>;
    listScript?: string[];

    generatedAudioUrl?: string;

    topic?: string;
    niche?: VideoNiche;
    duration?: VideoDuration;
}
