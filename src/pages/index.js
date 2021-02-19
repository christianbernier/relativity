import React, { useState, useEffect } from "react";
import { css } from "@emotion/core";
import GlobalCSS from "../components/GlobalCSS";
import Gap from "../components/Gap.js";
import Konva from "react-konva";

Konva.pixelRatio = 1;

//Default values
let stageSize = 600;
let numCircles = 6;
let maxFramesBetweenCalculations = 300;
let sizeMultiplier = 1.2;
let startingPositionX = 0;
let startingPositionY = 0;
let framesBetweenCircleRenders = 20;

//Parameters
const paramNames = [
  "Number of circles",
  "Top circles' starting position (in multiples of pi)",
  "Left circles' starting position (in multiples of pi)",
  "Max. frames between calculations",
  "Frames between calculations size multiplier",
  "Frames between circle rerenders",
];

const paramIDs = [
  "param-num-circles",
  "param-x-start",
  "param-y-start",
  "param-max-frames",
  "param-size-mult",
  "param-circle-frames",
];

const paramDefaults = ["6", "0", "0", "300", "1.2", "20"];

const setParameters = () => {
  const valuesForParams = [];
  for (const id of paramIDs) {
    valuesForParams.push(document.getElementById(id).value);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    if (valuesForParams[0] < 1) {
      window.alert(
        "Invalid parameter: Number of circles. The minimum value is 1."
      );
      return;
    }

    if (valuesForParams[3] < 0) {
      window.alert(
        "Invalid parameter: Max. frames between calculations. The minimum value is 0."
      );
      return;
    }

    window.location = `?circles=${valuesForParams[0]}&x=${valuesForParams[1]}&y=${valuesForParams[2]}&maxFrames=${valuesForParams[3]}&sizeMult=${valuesForParams[4]}&circleFrames=${valuesForParams[5]}`;
  }
};

//Colors
const hslToHex = (h, s, l) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const downloadURI = (uri, name) => {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToImage = () => {
  const stage = document.getElementsByTagName("CANVAS")[0];
  const dataURL = stage.toDataURL({ pixelRatio: 5 });
  downloadURI(dataURL, "lissajous.png");
};

//A "Pointer" is one of the circles, including the line extending down or to the right.
class Pointer extends React.Component {
  constructor(x_, y_, size_, type_, angle_, rate_, color_) {
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
    //Updates the actual values; does not redraw
    this.angle += (this.rate / 100) % (2 * Math.PI);
    this.tipX = this.size * Math.cos(this.angle);
    this.tipY = -1 * this.size * Math.sin(this.angle);
  }

  render(i) {
    //Actually draws the shape
    return (
      <>
        <Konva.Circle //Circle itself
          x={this.x}
          y={this.y}
          radius={this.size}
          stroke={hslToHex(360 * (this.color / numCircles), 100, 50)}
          key={`Circle-${this.type}-${i}`}
        />
        <Konva.Text //Text in the center, displaying the speed
          text={i + 1}
          x={this.x}
          y={this.y}
          align={"center"}
          verticalAlign={"middle"}
          fontSize={this.size}
          offsetX={this.size / 4}
          offsetY={(this.size * 2) / 5}
          fill={hslToHex(360 * (this.color / numCircles), 100, 50)}
          key={`Label-${this.type}-${i}`}
        />
        {this.type === 0 ? (
          <Konva.Line //Vertical line if it's a top circle
            x={this.x + this.tipX}
            y={this.y + this.tipY}
            points={[0, 0, 0, stageSize - (this.tipY + this.y)]}
            stroke={"white"}
            opacity={0.5}
            key={`VLine-${this.type}-${i}`}
          />
        ) : (
          <Konva.Line //Horizontal line if it's a left circle
            x={this.x + this.tipX}
            y={this.y + this.tipY}
            points={[0, 0, stageSize - (this.tipX + this.x), 0]}
            stroke={"white"}
            opacity={0.5}
            key={`HLine-${this.type}-${i}`}
          />
        )}
        <Konva.Circle //Point on the edge of the circle where the pointer is
          x={this.x + this.tipX}
          y={this.y + this.tipY}
          radius={6}
          fill={hslToHex(360 * (this.color / numCircles), 100, 50)}
          key={`Tip-${this.type}-${i}`}
        />
      </>
    );
  }
}

export default () => {
  let circleSpacing;
  let circleRadius;

  //Arrays of Pointer objects in both direcitons
  const [circlesX, setCirclesX] = useState([]);
  const [circlesY, setCirclesY] = useState([]);

  //2D Array of every intersection point
  const [intersections, setIntersections] = useState([]);

  //Frame counter and state variable for forced rerender
  let renderCycle = 0;
  const [rerender, setRerender] = useState(0);

  useEffect(() => {
    //This function is run once when the page loads
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      if (window.innerWidth < 500) {
        //Sets the size of the stage for mobile or desktop screens
        stageSize = window.innerWidth * 0.9;
      } else {
        stageSize = window.innerHeight * 0.8;
      }

      //Extracting parameters from the URL, if applicable
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const param0 = urlParams.get("circles");

      if (param0) {
        numCircles = urlParams.get("circles") - 0;
        startingPositionX = urlParams.get("x") - 0;
        startingPositionY = urlParams.get("y") - 0;
        maxFramesBetweenCalculations = urlParams.get("maxFrames") - 0;
        sizeMultiplier = urlParams.get("sizeMult") - 0;
        framesBetweenCircleRenders = urlParams.get("circleFrames") - 0;
      }
    }

    //Setting spacing variables with new values
    circleSpacing = (stageSize - 12) / (numCircles + 1);
    circleRadius = (0.4 * (stageSize - 12)) / (numCircles + 1);

    //Initialize circle arrays
    let currentCirclesX = [],
      currentCirclesY = [];

    for (let i = 0; i < numCircles; i++) {
      const nextCircleX = new Pointer(
        circleSpacing * (i + 1) + (circleSpacing - circleRadius) + 5, //X position
        circleRadius + 7, //Y position
        circleRadius, //Radius
        0, //Type (0 means horizontal)
        Math.PI * startingPositionX, //Starting angle
        (i + 1) / 4, //Rate
        i //Index (used for color)
      );
      const nextCircleY = new Pointer(
        circleRadius + 7, //X position
        circleSpacing * (i + 1) + (circleSpacing - circleRadius) + 5, //Y position
        circleRadius, //Radius
        1, //Type (1 means vertical)
        Math.PI * startingPositionY, //Starting angle
        (i + 1) / 4, //Rate
        i //Index (used for color)
      );

      currentCirclesX.push(nextCircleX);
      currentCirclesY.push(nextCircleY);
    }

    setCirclesX(currentCirclesX);
    setCirclesY(currentCirclesY);

    //Intersection 2D array initialization
    let inter = [];

    for (let x = 0; x < numCircles; x++) {
      let inter2 = [];

      for (let y = 0; y < numCircles; y++) {
        inter2.push([]);
      }

      inter.push(inter2);
    }

    setIntersections(inter);
  }, []);

  useEffect(() => {
    //This function runs every time the circlesX array changes (once, after it's initialized)
    setInterval(() => {
      //This function runs every millisecond (if it's running at maximum speed)

      //Update every circle's angle
      for (const circle of circlesX) {
        circle.update();
      }

      for (const circle of circlesY) {
        circle.update();
      }

      //Calculating intersection points
      let ints = intersections;

      for (let i = 0; i < circlesX.length; i++) {
        for (let j = 0; j < circlesY.length; j++) {
          //This if statement is to skip most frames, determined by the sizeMultiplier and maxFramesBetweenCalculations parameters
          if (
            renderCycle %
              Math.floor(
                maxFramesBetweenCalculations /
                  ((i + 1) * sizeMultiplier) /
                  ((j + 1) * sizeMultiplier)
              ) ===
            0
          ) {
            const cX = circlesX[i];
            const cY = circlesY[j];

            ints[i][j].push(cX.x + cX.tipX);
            ints[i][j].push(cY.y + cY.tipY);

            setIntersections(ints);
          }
        }
      }

      setRerender(renderCycle++); //Forces a rerender
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
          grid-template-rows: 100px auto;
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
            font-size: 2.2rem;
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
            circles in the animation). The numbers inside the circles express
            their relative speeds, which is also represented by their colors.
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
            In reality, these curves would not have such rough corners. If you
            have a more powerful computer, try changing the parameters below for
            smoother shapes.
          </p>
          <Gap height="10px" />
          <p
            css={css`
              font-size: 1.4rem;
              font-weight: 600;
              margin-bottom: 10px;
            `}
          >
            Export Image
          </p>
          <p
            css={css`
              font-size: 1.1rem;
              font-weight: 300;
              margin-top: 0;
            `}
          >
            You can export a high-quality version of the render using the button
            below.
          </p>
          <p
            css={css`
              font-size: 1.2rem;
              font-weight: 700;
              margin-bottom: 0;
              padding: 5px;
              background-color: rgb(60, 60, 60);
              border-radius: 5px;
              width: 50%;
              text-align: center;
              cursor: pointer;
            `}
            onClick={() => exportToImage()}
          >
            Download image
          </p>
          <Gap height="10px" />
          <p
            css={css`
              font-size: 1.4rem;
              font-weight: 600;
              margin-bottom: 10px;
            `}
          >
            Parameters
          </p>
          <p
            css={css`
              font-size: 1.1rem;
              font-weight: 300;
              margin-top: 0;
            `}
          >
            Try changing the parameters below to see different curves. Note:
            this depends on your computer's performance. The following changes
            will require more computing power: more circles, fewer frames
            between calculations, smaller size multipliers, fewer frames between
            circle rerenders.
          </p>
          {paramNames.map((param, i) => (
            <>
              <p
                css={css`
                  font-size: 1.1rem;
                  font-weight: 300;
                  font-style: italic;
                  margin-bottom: 0;
                `}
              >
                {param}:
              </p>
              <input
                type="number"
                defaultValue={paramDefaults[i]}
                id={paramIDs[i]}
              />
            </>
          ))}
          <p
            css={css`
              font-size: 1.2rem;
              font-weight: 700;
              margin-bottom: 0;
              padding: 5px;
              background-color: rgb(60, 60, 60);
              border-radius: 5px;
              width: 50%;
              text-align: center;
              cursor: pointer;
            `}
            onClick={() => setParameters()}
          >
            See the results!
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
          width={stageSize}
          height={stageSize}
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
              width={stageSize}
              height={stageSize}
              fill={"rgba(43, 43, 43)"}
            />
            {renderCycle % framesBetweenCircleRenders === 0 ? (
              circlesX.map((c, i) => c.render(i))
            ) : (
              <></>
            )}
            {renderCycle % framesBetweenCircleRenders === 0 ? (
              circlesY.map((c, i) => c.render(i))
            ) : (
              <></>
            )}
            {intersections.map((x, i) =>
              x.map((y, j) => (
                <Konva.Line
                  x={0}
                  y={0}
                  points={y}
                  stroke={"#ccc"}
                  key={`IntersectionLine-${i}-${j}`}
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
