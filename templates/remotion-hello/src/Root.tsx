import {Composition} from 'remotion';
import {Hello} from './Hello';

export const Root = () => (
  <Composition id="hello" component={Hello} durationInFrames={120} fps={30} width={1920} height={1080} />
);
