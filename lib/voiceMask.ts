// Browser-only voice masking. Records via MediaRecorder, decodes the
// result, then renders it through an OfflineAudioContext at a different
// sample rate to shift pitch (a classic "chipmunk/deepen" trick) before
// re-encoding to WAV. Runs entirely on-device — the original recording
// is never uploaded or sent anywhere.

export async function maskAudioBlob(blob: Blob, semitoneShift = -3): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtx();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

  const rateFactor = Math.pow(2, semitoneShift / 12);
  const newSampleRate = Math.round(decoded.sampleRate * rateFactor);
  // Clamp to valid OfflineAudioContext sample rate bounds.
  const clampedRate = Math.min(Math.max(newSampleRate, 8000), 192000);

  const offlineCtx = new OfflineAudioContext(
    decoded.numberOfChannels,
    Math.ceil(decoded.length * (clampedRate / decoded.sampleRate)),
    clampedRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineCtx.destination);
  source.start();

  const rendered = await offlineCtx.startRendering();
  await audioCtx.close();

  return audioBufferToWavBlob(rendered);
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const samples = interleave(buffer);
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const bufferLength = 44 + samples.length * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * bytesPerSample, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function interleave(buffer: AudioBuffer): Float32Array {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length * numChannels;
  const result = new Float32Array(length);
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c));

  let index = 0;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      result[index++] = channels[c][i];
    }
  }
  return result;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}
