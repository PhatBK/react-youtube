import React from 'react';
import YouTube from 'youtube-player';

/*

Available options that you can pass to the YouTube Iframe API are

- videoId             updated by Player#cueVideoById

- width               updated by Player#setSize
- height              updated by Player#setSize

- playerVars
  - autoplay          Player#loadVideoById/Playlist
  - cc_lang_pref      [static]
  - cc_load_policy    [static]
  - color             [static]
  - controls          [static]
  - disablekb         [static]
  - enablejsapi       [static]
  - end               Player#cue/load* should set endSeconds
  - fs                [static]
  - hl                [static]
  - iv_load_policy    [static]
  - list              [static]
  - listType          [static]
  - loop              updated by Player#setLoop
  - modestbranding    [static]
  - origin            [static]
  - playlist          updated by Player#cue/loadPlaylist 
  - playsinline       [static]
  - rel               [static]
  - start             Player#cue/load* should set startSeconds
  - widget_referrer   [static]

- events [note]
  - onReady
  - onStateChange
  - onPlaybackQualityChange
  - onPlaybackRateChange
  - onError
  - onApiChange

[note] youtube-player fixes the very strange Player#addEventListener behaviour
but does this by overwriting the events property so we can't set these immediately.

*/

/*

type Config = {
  videoId: string,

  autoplay: boolean,
  startSeconds: number,
  endSeconds: number,

  loop: boolean,
  playing: boolean,
  mute: boolean,
  volume: number,
  playbackRate: number,
  width: number,
  height: number,

  onReady: () => {},
  onStateChange: () => {},
  onPlaybackQualityChange: () => {},
  onPlaybackRateChange: () => {},
  onError: () => {},
  onApiChange: () => {},
};

*/

/* eslint-disable import/prefer-default-export, consistent-return */

export default function useYouTube(config, playerVars) {
  const [target, setTarget] = React.useState(null);
  const [player, setPlayer] = React.useState(null);
  const configRef = React.useRef(config);

  React.useEffect(() => {
    configRef.current = config;
  }, [config]);

  React.useEffect(() => {
    if (target === null) return;

    const frame = target.appendChild(document.createElement('div'));

    const instance = YouTube(frame, {
      videoId: configRef.current.videoId,
      width: configRef.current.width,
      height: configRef.current.height,
      playerVars,
    });

    instance.on('ready', (event) => {
      if (typeof configRef.current.onReady === 'function') {
        configRef.current.onReady(event);
      }
    });
    instance.on('stateChange', (event) => {
      if (typeof configRef.current.onStateChange === 'function') {
        configRef.current.onStateChange(event);
      }
    });
    instance.on('playbackQualityChange', (event) => {
      if (typeof configRef.current.onPlaybackQualityChange === 'function') {
        configRef.current.onPlaybackQualityChange(event);
      }
    });
    instance.on('playbackRateChange', (event) => {
      if (typeof configRef.current.onPlaybackRateChange === 'function') {
        configRef.current.onPlaybackRateChange(event);
      }
    });
    instance.on('error', (event) => {
      if (typeof configRef.current.onError === 'function') {
        configRef.current.onError(event);
      }
    });
    instance.on('apiChange', (event) => {
      if (typeof configRef.current.onApiChange === 'function') {
        configRef.current.onApiChange(event);
      }
    });

    setPlayer(instance);

    return () => {
      instance.destroy();
      frame.remove();
      setPlayer(null);
    };
  }, [target, playerVars]);

  // videoId, autoplay, startSeconds, endSeconds
  React.useEffect(() => {
    if (player === null) return;

    if (!config.videoId) {
      player.stopVideo();
      return;
    }

    if (config.autoplay || configRef.current.playing) {
      player.loadVideoById({
        videoId: config.videoId,
        startSeconds: configRef.current.startSeconds,
        endSeconds: configRef.current.endSeconds,
      });
      return;
    }

    player.cueVideoById({
      videoId: config.videoId,
      startSeconds: configRef.current.startSeconds,
      endSeconds: configRef.current.endSeconds,
    });
  }, [player, config.videoId, config.autoplay]);

  // playing
  React.useEffect(() => {
    if (player === null) return;

    if (config.playing) player.playVideo();
    else player.pauseVideo();
  }, [player, config.playing]);

  // loop
  React.useEffect(() => {
    if (player === null) return;

    player.setLoop(config.loop);
  }, [player, config.loop]);

  // volume
  React.useEffect(() => {
    if (player === null) return;

    player.setVolume(config.volume);
  }, [player, config.volume]);

  // mute
  React.useEffect(() => {
    if (player === null) return;

    if (config.mute) player.mute();
    else player.unMute();
  }, [player, config.mute]);

  // playbackRate
  React.useEffect(() => {
    if (player === null) return;

    player.setPlaybackRate(config.playbackRate);
  }, [player, config.playbackRate]);

  // width, height
  React.useEffect(() => {
    if (player === null) return;
    if (config.width === undefined && config.height === undefined) return;

    player.setSize(config.width, config.height);
  }, [player, config.width, config.height]);

  return {
    player,
    targetRef: setTarget,
  };
}
