import React from "react";
import { css } from "@emotion/core";

export default ({ height }) => (
  <div
    css={css`
      height: ${height};
    `}
  />
);
