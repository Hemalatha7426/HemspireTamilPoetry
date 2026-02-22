import MediaPage from "../components/MediaPage";
import { poemApi } from "../api/mediaApi";

export default function PoemsPage() {
  return <MediaPage title="Poems" type="poem" api={poemApi} />;
}
