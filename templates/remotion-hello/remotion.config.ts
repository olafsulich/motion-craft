import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('png'); // lossless frames into the encoder; flat colours and thin text stay clean
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setOverwriteOutput(true);
