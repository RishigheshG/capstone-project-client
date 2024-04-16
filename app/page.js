import Image from "next/image";
import AudioRec  from "./components/audioRec";
import { Worker } from "node:worker_threads"

export default function Home() {
  return (
      <>
        <AudioRec />
      </>
    );
}
