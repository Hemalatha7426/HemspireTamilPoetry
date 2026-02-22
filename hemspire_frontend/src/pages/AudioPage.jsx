import MediaPage from "../components/MediaPage";
import { audioApi } from "../api/mediaApi";

export default function AudioPage() {
  return <MediaPage title="Audio" type="audio" api={audioApi} />;
}
