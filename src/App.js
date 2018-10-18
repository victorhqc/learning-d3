import React, { Component } from 'react';
import { appleStock } from '@vx/mock-data';
import { scaleTime, scaleLinear } from '@vx/scale';
import { Group } from '@vx/group';
import { AreaClosed, LinePath } from '@vx/shape';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { LinearGradient } from '@vx/gradient';
import { withTooltip, Tooltip } from '@vx/tooltip';
import { curveNatural } from '@vx/curve';
import { localPoint } from '@vx/event';
import { extent, max } from 'd3-array';

import './index.css';

const x = d => new Date(d.date);
const y = d => d.close;

class App extends Component {
  constructor(props) {
    super(props);

    this.timeout = null;

    this.doMouseMove = this.doMouseMove.bind(this);
    this.doMouseLeave = this.doMouseLeave.bind(this);
  }

  doMouseMove({ xScale }) {
    const { showTooltip, margin } = this.props;

    return data => event => {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      console.log('TOOLTIP DATA', data);
      const coordinates = localPoint(event.target.ownerSVGElement, event);
      console.log('COORDINATES', coordinates);
      console.log('X position', coordinates.x - margin.left);
      // const top = event.clientY - margin.top - data.height;
      // const left = xScale(data.x) + data.width
    };
  }

  doMouseLeave(data) {
    const { hideTooltip } = this.props;

    return event => {
      this.timeout = setTimeout(() => {
        hideTooltip();
      }, 300);
    };
  }

  getChartDimensions() {
    const { width, height, margin } = this.props;

    return {
      xMax: width - margin.left - margin.right,
      yMax: height - margin.top - margin.bottom,
    };
  }

  render() {
    const { data, width, height, margin } = this.props;
    const dimensions = this.getChartDimensions();
    const xScale = scaleTime({
      range: [0, dimensions.xMax],
      domain: extent(data, x),
    });
    const yScale = scaleLinear({
      range: [dimensions.yMax, 0],
      domain: [0, max(data, y)],
    });
    return (
      <div className="App">
        <h1>Getting started with @vx</h1>
        <svg width={width} height={height}>
          <Group top={margin.top} left={margin.left}>
            <LinearGradient from="#fbc2eb" to="#a6c1ee" id="gradient" />
            <AxisLeft
              scale={yScale}
              top={0}
              left={0}
              label={'Close Price ($)'}
              stroke={'#1b1a1e'}
              ticketTextFill={'#1b1a1e'}
            />
            <AxisBottom
              scale={xScale}
              top={dimensions.yMax}
              label={'Years'}
              stroke={'#1b1a1e'}
              tickTextFill={'#1b1a1e'}
            />
            <LinePath
              data={data}
              xScale={xScale}
              yScale={yScale}
              x={x}
              y={y}
              stroke={'url(#gradient'}
              curve={curveNatural}
              onMouseMove={this.doMouseMove({ xScale })}
              onMouseLeave={this.doMouseLeave}
            />
          </Group>
        </svg>
      </div>
    );
  }
}

App.defaultProps = {
  data: appleStock,
  margin: {
    top: 60,
    bottom: 60,
    left: 80,
    right: 80,
  },
  width: 750,
  height: 400,
};

export default withTooltip(App);
