import PairwiseResultRenderer from '@/lib/graphdecoder/PairwiseResultRenderer';
import PerformanceRenderer from '@/lib/graphdecoder/PerformanceRenderer';
import ScoringResultRenderer from '@/lib/graphdecoder/ScoringResultRenderer';
import * as React from 'react';

export interface IGraphDecoderProps {
}

export default function GraphDecoder(props: IGraphDecoderProps) {
  React.useEffect(() => {
    new ScoringResultRenderer('svg-scoring-result').draw();
    new PairwiseResultRenderer('svg-pairing-result').draw();
    new PerformanceRenderer('svg-performance').draw();
  });
  return (
    <div>
      <h2>Scoring Results</h2>
      <svg id={'svg-scoring-result'} />
      <h2>Paring Results</h2>
      <svg id={'svg-pairing-result'} />
      <h2>Performance</h2>
      <svg id={'svg-performance'} />
    </div>
  );
}
