import React, { useState, useEffect } from "react";
import { css } from "@emotion/core";
import GlobalCSS from "../components/GlobalCSS";
import Gap from "../components/Gap.js";
import Konva from "react-konva";

Konva.pixelRatio = 1;

let stageWidth = 600,
  stageHeight = 600;

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (window.innerWidth < 500) {
    stageWidth = window.innerWidth * 0.9;
    stageHeight = window.innerWidth * 0.9;
  } else {
    stageWidth = window.innerHeight * 0.8;
    stageHeight = window.innerHeight * 0.8;
  }
}

const colorReference = [
  "rgb(230, 35, 21)",
  "rgb(240, 171, 24)",
  "rgb(247, 230, 45)",
  "rgb(21, 173, 49)",
  "rgb(21, 27, 209)",
];

class Pointer extends React.Component {
  constructor(x_, y_, size_, type_, angle_, rate_, color_) {
    //rate is in radians per second
    super();
    this.x = x_;
    this.y = y_;
    this.size = size_;
    this.type = type_; // 0 is a circleX; 1 is a circleY
    this.angle = angle_;
    this.rate = rate_;
    this.color = color_;
    this.tipX = this.size * Math.cos(this.angle);
    this.tipY = -1 * this.size * Math.sin(this.angle);
  }

  update() {
    this.angle += (this.rate / 100) % (2 * Math.PI);
    this.tipX = this.size * Math.cos(this.angle);
    this.tipY = -1 * this.size * Math.sin(this.angle);
  }

  render() {
    return (
      <>
        <Konva.Circle
          x={this.x}
          y={this.y}
          radius={this.size}
          stroke={colorReference[this.color]}
        />
        <Konva.Line
          x={this.x}
          y={this.y}
          points={[0, 0, this.tipX, this.tipY]}
          stroke={colorReference[this.color]}
        />
        {this.type === 0 ? (
          <Konva.Line
            x={this.x + this.tipX}
            y={this.y + this.tipY}
            points={[0, 0, 0, stageHeight - (this.tipY + this.y)]}
            stroke={"white"}
            opacity={0.5}
          />
        ) : (
          <Konva.Line
            x={this.x + this.tipX}
            y={this.y + this.tipY}
            points={[0, 0, stageWidth - (this.tipX + this.x), 0]}
            stroke={"white"}
            opacity={0.5}
          />
        )}
      </>
    );
  }
}

export default () => {
  const numCircles = 5;
  const circleSpacing = stageWidth / (numCircles + 1);
  const circleRadius = (0.4 * stageWidth) / (numCircles + 1);

  const [circlesX, setCirclesX] = useState([]);
  const [circlesY, setCirclesY] = useState([]);

  const [intersections, setIntersections] = useState([]);

  let renderCycle = 0;
  const [rerender, setRerender] = useState(0);

  useEffect(() => {
    //init circles
    let currentCirclesX = [],
      currentCirclesY = [];

    for (let i = 0; i < numCircles; i++) {
      const nextCircleX = new Pointer(
        circleSpacing * (i + 1) + (circleSpacing - circleRadius) - 1,
        circleRadius + 1,
        circleRadius,
        0,
        0,
        (i + 1) / 4,
        i
      );
      const nextCircleY = new Pointer(
        circleRadius + 1,
        circleSpacing * (i + 1) + (circleSpacing - circleRadius) - 1,
        circleRadius,
        1,
        0,
        (i + 1) / 4,
        i
      );
      currentCirclesX.push(nextCircleX);
      currentCirclesY.push(nextCircleY);
    }

    let inter = [];
    for (let x = 0; x < numCircles; x++) {
      let inter2 = [];
      for (let y = 0; y < numCircles; y++) {
        inter2.push([]);
      }
      inter.push(inter2);
    }
    setIntersections(inter);

    setCirclesX(currentCirclesX);
    setCirclesY(currentCirclesY);
  }, []);

  useEffect(() => {
    setInterval(() => {
      for (const circle of circlesX) {
        circle.update();
      }
      for (const circle of circlesY) {
        circle.update();
      }

      let ints = intersections;
      for (let i = 0; i < circlesX.length; i++) {
        for (let j = 0; j < circlesY.length; j++) {
          if (renderCycle % Math.floor(300 / (i + 1.2) / (j + 1.2)) === 0) {
            const cX = circlesX[i];
            const cY = circlesY[j];
            ints[i][j].push(cX.x + cX.tipX);
            ints[i][j].push(cY.y + cY.tipY);
            setIntersections(ints);
          }
        }
      }
      setRerender(renderCycle++);
    }, 1);
  }, [circlesX]);

  return (
    <>
      <GlobalCSS />
      <div
        css={css`
          display: grid;
          width: 100vw;
          height: 100vh;
          overflow-x: hidden;
          grid-template-areas:
            "title stage"
            "infoLeft stage";
          grid-template-rows: auto auto;
          grid-template-columns: 30vw 70vw;

          @media only screen and (max-width: 500px) {
            grid-template-areas: "title" "stage" "infoLeft" "gap";
            grid-template-rows: auto auto auto 50px;
            grid-template-columns: 100vw;
          }
        `}
      >
        <p
          css={css`
            font-size: 2rem;
            font-weight: 700;
            margin-top: 0;
            grid-area: title;
            padding: 50px 20px 0 20px;

            @media only screen and (max-width: 500px) {
              padding: 50px 20px;
            }
          `}
        >
          Lissajous Curves
        </p>
        <div
          css={css`
            grid-area: infoLeft;
            padding: 50px 20px;
          `}
        >
          <p
            css={css`
              font-size: 1.1rem;
              font-weight: 300;
              margin-top: 0;
            `}
          >
            Lissajous curves describe complex harmonic motion and are defined by
            parametric equations of two sinusoidal functions (represetned by the
            circles in the animation to the right). The colors of the circles
            represent their relative speed (red - 1; orange - 2; yellow - 3;
            green - 4; blue - 5).
          </p>
          <Gap height="10px" />
          <p
            css={css`
              font-size: 1.1rem;
              font-weight: 300;
              margin-top: 0;
            `}
          >
            To improve efficiency in drawing, simpler curves are approximated by
            fewer lines. Since the intersection points are only calculated
            periodically, it makes some curves with small periods look jagged.
            In reality, these curves would not have such rough corners.
          </p>
          <Gap height="10px" />
          <p
            css={css`
              font-size: 1.4rem;
              font-weight: 600;
              margin-bottom: 10px;
            `}
          >
            Site information
          </p>
          <p
            css={css`
              font-size: 1.1rem;
              font-weight: 300;
              margin-top: 0;
            `}
          >
            This site was made in February 2021 by Christian Bernier. Feel free
            to check out the{" "}
            <a href="https://github.com/christianbernier/lissajous">
              source code
            </a>
            . If you have any questions or recommendations, free free to{" "}
            <a href="https://cbernier.com">contact me</a>.
          </p>
        </div>
        <Konva.Stage
          width={stageWidth}
          height={stageHeight}
          css={css`
            grid-area: stage;
            display: flex;
            justify-content: center;
            margin-top: 50px;

            @media only screen and (max-width: 500px) {
              margin-top: 0;
            }
          `}
        >
          <Konva.FastLayer>
            <Konva.Rect
              x={0}
              y={0}
              width={stageWidth}
              height={stageHeight}
              fill={"rgba(43, 43, 43)"}
            />
            {renderCycle % 20 === 0 ? circlesX.map((c) => c.render()) : <></>}
            {renderCycle % 20 === 0 ? circlesY.map((c) => c.render()) : <></>}
            {intersections.map((x) =>
              x.map((y) => (
                <Konva.Line
                  x={0}
                  y={0}
                  points={y}
                  stroke={"rgb(182, 30, 199)"}
                />
              ))
            )}
          </Konva.FastLayer>
        </Konva.Stage>
        <div
          css={css`
            grid-area: gap;
          `}
        />
      </div>
    </>
  );
};
