// @ts-nocheck
import * as d3 from 'd3';
import SVGBox from '../SVGBox';
import * as _ from 'lodash';

export default class EvalSemanticsRenderer extends SVGBox {
  public async draw() {
    const width = 880;
    const height = 190;
    const blues = ['#074080', '#96AAC4', '#CFD9E5'];
    const margin = {
      left: 110,
      right: 90,
      top: 40,
      bottom: 10,
    };

    this.svg
        .attr('width', width)
        .attr('height', height);

    const score = await d3.csv('/data/semanticmap/eval-simscore.csv');
    const detail = await d3.json('/data/semanticmap/eval-simdetail.json');
    const detailAll = detail.all;
    const scoreNoMean = score.filter(((one) => one.measure != 'mean'));
    const scoreItems = [];
    for (const s of score) {
      scoreItems.push({
        'measure': s.measure,
        'type': 'all',
        'pearson': s.all_pearson,
        'p': s.all_p,
      });
      scoreItems.push({
        'measure': s.measure,
        'type': 'def',
        'pearson': s.def_pearson,
        'p': s.def_p,
      });
      scoreItems.push({
        'measure': s.measure,
        'type': 'word',
        'pearson': s.word_pearson,
        'p': s.word_p,
      });
    }

    const measures = scoreNoMean.map((one) => one.measure);
    const readableTypes = ['All', 'w/o Context', 'w/o Context & Def.'];
    const types = ['all', 'def', 'word'];

    const scaleMeasure = d3.scaleBand()
        .domain(measures)
        .range([margin.left, width - margin.right]);

    const scaleMeasureWithMean = d3.scaleBand()
        .domain([...measures, 'mean'])
        .range([margin.left, width - margin.right + scaleMeasure.bandwidth()]);
    console.log(scaleMeasureWithMean.domain());

    const scalePearsonY = d3.scaleBand()
        .domain(types)
        .range([0, height - margin.bottom - margin.top - scaleMeasure.bandwidth()]);

    const scalePearsonX = d3.scaleLinear()
        .domain([-0.2, 0.8])
        .range([0, scaleMeasure.bandwidth()]);

    const scaleBarColor = d3.scaleOrdinal()
        .domain([0, ...[...types].reverse(), 1, 2])
        .range(d3.schemeGreens[6]);

    for (const i = 0; i < measures.length; i++) {
      const m = measures[i];
      const mG = this.svg.append('g')
          .attr('transform', `translate(${scaleMeasure(m)}, ${margin.top})`);

      mG.append('text')
          .attr('transform', `translate(${scaleMeasure.bandwidth() / 2}, -20)`)
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('text-anchor', 'middle')
          .text(m);
      // // X -> Survey
      // const scaleDetailX = d3.scaleLinear()
      //     .domain([(_.min(detailAll[m?.toLowerCase()].survey)) * 0.9, (_.max(detailAll[m?.toLowerCase()].survey) * 1.1)])
      //     .range([0, scaleMeasure.bandwidth()]);
      // // Y -> Model
      // const scaleDetailY = d3.scaleLinear()
      //     .domain([(_.min(detailAll[m?.toLowerCase()].model) * 0.9), (_.max(detailAll[m?.toLowerCase()].model) * 1.1)])
      //     .range([scaleMeasure.bandwidth(), 0]);
      // X -> Survey
      const scaleDetailX = d3.scaleLinear()
          .domain([1.2, 4.8])
          .range([0, scaleMeasure.bandwidth()]);
      // Y -> Model
      const scaleDetailY = d3.scaleLinear()
          .domain([0, 0.6])
          .range([scaleMeasure.bandwidth(), 0]);


      // Axis
      if (i == 0) {
        mG.append('g')
            .attr('class', 'light-line')
            .call(
                d3.axisLeft(scaleDetailY).tickValues([0.15, 0.3, 0.45])
                    .tickSize(-scaleMeasure.bandwidth() * 8),
            );
      }
      mG.append('g')
          .attr('class', 'light-line')
          .call(
              d3.axisTop(scaleDetailX)
                  .tickSize(-scaleMeasure.bandwidth())
                  .ticks(3)
                  .tickFormat((d) => d.toFixed(1)),
          );

      mG.append('rect')
          .attr('stroke', 'black')
          .attr('stroke-width', 0.5)
          .attr('fill', 'none')
          .attr('width', scaleMeasure.bandwidth())
          .attr('height', scaleMeasure.bandwidth());

      const coordinates = _.zip(detailAll[m?.toLowerCase()].survey, detailAll[m?.toLowerCase()].model);

      mG.selectAll('.measure-detail-circle')
          .data(coordinates)
          .enter()
          .append('circle')
          .attr('class', 'measure-detail-circle')
          .attr('cx', (d) => scaleDetailX(d[0]))
          .attr('cy', (d) => scaleDetailY(d[1]))
          .attr('r', 2.5)
          .attr('opacity', 0.6)
          .attr('fill', blues[0]);
    }

    const pearsonG = this.svg.append('g')
        .attr('transform', `translate(${-0.5}, ${scaleMeasure.bandwidth() + margin.top + 0.5})`);

    pearsonG.append('text')
        .attr('x', scaleMeasureWithMean('mean'))
        .attr('transform', `translate(${scaleMeasure.bandwidth() / 2}, -10)`)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text('Average');

    const personItemG = pearsonG.selectAll('.measure-pearson')
        .data(scoreItems)
        .enter()
        .append('g')
        .attr('class', 'measure-pearson')
        .attr('transform', (d) => `translate(${scaleMeasureWithMean(d.measure)}, ${scalePearsonY(d.type)})`);
    personItemG.append('rect')
        .attr('width', (d) => scalePearsonX(d.pearson))
        .attr('height', scalePearsonY.bandwidth())
        .attr('fill', (d) => scaleBarColor(d.type));
    personItemG.append('text')
        .attr('font-size', '11px')
        .attr('font-weight', (d) => d.pearson == '0.516' ? 'bold' : 'normal')
        .attr('text-anchor', 'start')
        .attr('x', 3)
        .attr('y', 3 + scalePearsonY.bandwidth() / 2)
        .text((d) => `${d.pearson}  (${parseFloat(d.p).toFixed(3)})`);
    pearsonG.selectAll('.legend-text')
        .data(types)
        .enter()
        .append('text')
        .attr('class', 'legend-text')
        .attr('font-size', '12px')
        .attr('text-anchor', 'end')
        .text((d, i) => readableTypes[i])
        .attr('x', margin.left - 3)
        .attr('y', (d, i) => scalePearsonY(types[i]) + scalePearsonY.bandwidth() / 2 + 3);
  }
}
