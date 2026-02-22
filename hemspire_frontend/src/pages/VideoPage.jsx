import MediaPage from "../components/MediaPage";
import { videoApi } from "../api/mediaApi";

export default function VideoPage() {
  return <MediaPage title="Video" type="video" api={videoApi} />;
}
