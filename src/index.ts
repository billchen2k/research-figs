import * as d3 from 'd3';
import './style/styles.css';
import PairwiseResultRenderer from './lib/PairwiseResultRenderer';
import ScoringResultRenderer from './lib/ScoringResultRenderer';

const app = d3.select('#app');

app.append('h1').text('GraphDecoder Pics');

app.append('h2').text('Scoring Results');
new ScoringResultRenderer('svg-scoring-result').draw();

app.append('h2').text('Pairing Results');
new PairwiseResultRenderer('svg-pairing-result').draw();

app.append('p')
    .text(`Updated: ${new Date().toISOString()}`);
