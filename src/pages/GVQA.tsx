import PerformanceRenderer from '@/lib/graphdecoder/PerformanceRenderer';
import * as React from 'react';
import * as d3 from 'd3';
import {GVQAQuestionnaireRenderer} from '@/lib/gvqa/GVQAQuestionnaireRenderer';


export interface IGVQAProps {
}

export default function GVQA(props: IGVQAProps) {
  React.useEffect(() => {
    new GVQAQuestionnaireRenderer('svg-questionnaire').draw();
  });

  return (
    <div>
      <h2>Questionnaire</h2>
      <svg id={'svg-questionnaire'} />
    </div>
  );
}

