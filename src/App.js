import React, { Component } from 'react';
import { appleStock } from '@vx/mock-data';
import { scaleTime, scaleLinear } from '@vx/scale';
import { Group } from '@vx/group';
import { AreaClosed, LinePath } from '@vx/shape';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { GradientPinkRed } from '@vx/gradient';
import { withTooltip, Tooltip } from '@vx/tooltip';
import { Marker } from '@vx/marker';
import { curveNatural } from '@vx/curve';
import { localPoint } from '@vx/event';
import { extent, max } from 'd3-array';

import './index.css';

const x = d => new Date(d.date);
const y = d => d.close;

const getDimensions = ({ width, height, margin }) => ({
  xMax: width - margin.left - margin.right,
  yMax: height - margin.top - margin.bottom,
});

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPosition: {
        x: 0,
        y: 0,
      },
      dimensions: getDimensions(props),
      currentValue: {
        date: null,
        close: 0,
      },
    };

    this.timeout = null;
    this.xScale = null;
    this.yScale = null;

    this.doMouseMove = this.doMouseMove.bind(this);
    // this.doMouseLeave = this.doMouseLeave.bind(this);
  }

  componentWillMount() {
    this.setScales();
  }

  setScales() {
    const { data } = this.props;
    const { dimensions } = this.state;

    this.xScale = scaleTime({
      range: [0, dimensions.xMax],
      domain: extent(data, x),
    });

    this.yScale = scaleLinear({
      range: [dimensions.yMax, 0],
      domain: [0, max(data, y)],
    });
  }

  doMouseMove(data) {
    const { showTooltip, margin, width } = this.props;

    return event => {
      const coordinates = localPoint(event.target.ownerSVGElement, event);

      const currentIndex =
        ((coordinates.x - margin.left) * data.length) /
        (width - margin.left - margin.right);

      this.setState(() => ({
        currentPosition: {
          x: coordinates.x - margin.left,
          y: coordinates.y - margin.bottom,
        },
        currentValue: data[Math.ceil(currentIndex)],
      }));
    };
  }

  // doMouseLeave(data) {
  //   const { hideTooltip } = this.props;
  //
  //   return event => {
  //     this.timeout = setTimeout(() => {
  //       hideTooltip();
  //     }, 300);
  //   };
  // }

  render() {
    const { data, width, height, margin } = this.props;
    const { dimensions, currentPosition, currentValue } = this.state;

    if (!dimensions || !this.xScale || !this.yScale) {
      return null;
    }

    return (
      <div className="App">
        <h1>Getting started with @vx</h1>
        <svg width={width} height={height}>
          <Group top={margin.top} left={margin.left}>
            <GradientPinkRed id="gradient" />
            <AxisLeft
              scale={this.yScale}
              top={0}
              left={0}
              label={'Close Price ($)'}
              stroke={'#1b1a1e'}
              ticketTextFill={'#1b1a1e'}
            />
            <AxisBottom
              scale={this.xScale}
              top={dimensions.yMax}
              label={'Years'}
              stroke={'#1b1a1e'}
              tickTextFill={'#1b1a1e'}
            />
            <AreaClosed
              data={data}
              xScale={this.xScale}
              yScale={this.yScale}
              x={x}
              y={y}
              fill="url(#gradient)"
              stroke="none"
              // stroke={'url(#gradient'}
              curve={curveNatural}
              onMouseMove={this.doMouseMove}
              // onMouseLeave={this.doMouseLeave}
            />
            <Marker
              from={{ x: currentPosition.x, y: 0 }}
              to={{ x: currentPosition.x, y: dimensions.yMax }}
              stroke={'black'}
              label={`Closed at: ${y(currentValue)}`}
              labelStroke={'none'}
              labelDx={6}
              labelDy={15}
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
