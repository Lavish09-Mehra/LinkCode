import React from "react";

type Offset = readonly [x: number, y: number];
type BoxPath = readonly Offset[];

// 11 steps per box: 9.09%, 18.18%, ... 100%
const PATHS: readonly BoxPath[] = [
  [[-26,0],[0,0],[0,0],[26,0],[26,26],[26,26],[26,26],[26,0],[0,0],[-26,0],[0,0]],
  [[0,0],[26,0],[0,0],[26,0],[26,26],[26,26],[26,26],[26,26],[0,26],[0,26],[0,0]],
  [[-26,0],[-26,0],[0,0],[-26,0],[-26,0],[-26,0],[-26,0],[-26,0],[-26,-26],[0,-26],[0,0]],
  [[-26,0],[-26,0],[-26,-26],[0,-26],[0,0],[0,-26],[0,-26],[0,-26],[-26,-26],[-26,0],[0,0]],
  [[0,0],[0,0],[0,0],[26,0],[26,0],[26,0],[26,0],[26,0],[26,-26],[0,-26],[0,0]],
  [[0,0],[-26,0],[-26,0],[0,0],[0,0],[0,0],[0,0],[0,26],[-26,26],[-26,0],[0,0]],
  [[26,0],[26,0],[26,0],[0,0],[0,-26],[26,-26],[0,-26],[0,-26],[0,0],[26,0],[0,0]],
  [[0,0],[-26,0],[-26,-26],[0,-26],[0,-26],[0,-26],[0,-26],[0,-26],[26,-26],[26,0],[0,0]],
  [[-26,0],[-26,0],[0,0],[-26,0],[0,0],[0,0],[-26,0],[-26,0],[-52,0],[-26,0],[0,0]],
];

const keyframes: string = PATHS.map((steps, i) => {
  const frames = steps
    .map(
      ([x, y], s) =>
        `${(((s + 1) * 100) / 11).toFixed(4)}% { transform: translate(${x}px, ${y}px); }`
    )
    .join("\n  ");
  return `@keyframes moveBox-${i + 1} {\n  ${frames}\n}\n.banter-loader__box:nth-child(${i + 1}) { animation: moveBox-${i + 1} 4s infinite; }`;
}).join("\n");

const css = `
.banter-loader {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 72px;
  height: 72px;
  margin-left: -36px;
  margin-top: -36px;
}
.banter-loader__box {
  float: left;
  position: relative;
  width: 20px;
  height: 20px;
  margin-right: 6px;
}
.banter-loader__box:before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #fff;
}
.banter-loader__box:nth-child(3n) {
  margin-right: 0;
  margin-bottom: 6px;
}
.banter-loader__box:nth-child(1):before,
.banter-loader__box:nth-child(4):before {
  margin-left: 26px;
}
.banter-loader__box:nth-child(3):before {
  margin-top: 52px;
}
.banter-loader__box:last-child {
  margin-bottom: 0;
}
@media (prefers-reduced-motion: reduce) {
  .banter-loader__box { animation-duration: 12s !important; }
}
${keyframes}
`;

export const BanterLoader: React.FC = () => (
  <>
    <style>{css}</style>
    <div className="banter-loader" role="status" aria-label="Loading">
      {Array.from({ length: 9 }, (_, i) => (
        <div className="banter-loader__box" key={i} />
      ))}
    </div>
  </>
);

// Demo wrapper: the loader is white, so it needs a dark background.
const App: React.FC = () => (
  <div style={{ position: "relative", minHeight: "100vh", background: "#111" }}>
    <BanterLoader />
  </div>
);

export default App;