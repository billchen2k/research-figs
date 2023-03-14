import POITaxonomyRenderer from '@/lib/semanticmap/POITaxonomyRenderer';
import * as React from 'react';

export interface ISemanticMapProps {
}

export default function SemanticMap(props: ISemanticMapProps) {
  React.useEffect(() => {
    new POITaxonomyRenderer('svg-taxonomy').draw();
  });
  return (
    <div>
      <h2>Taxonomy</h2>
      <svg id='svg-taxonomy'></svg>
    </div>
  );
}
