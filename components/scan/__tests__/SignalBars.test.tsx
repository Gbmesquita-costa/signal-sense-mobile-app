import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { SignalBars } from "../SignalBars";

type Props = Parameters<typeof SignalBars>[0];

/** Renders the bars and returns each bar's background color. */
const renderBarColors = async (props: Props) => {
  const { toJSON } = await render(<SignalBars {...props} />);
  const bars = toJSON()?.children ?? [];

  return bars.map((bar) =>
    typeof bar === "string"
      ? null
      : StyleSheet.flatten(bar.props.style)?.backgroundColor,
  );
};

describe("SignalBars", () => {
  it("fills every bar for a strong signal", async () => {
    expect(
      await renderBarColors({ strength: "strong", color: "#10B981" }),
    ).toEqual(["#10B981", "#10B981", "#10B981"]);
  });

  it("fills only the first bar for a weak signal", async () => {
    expect(
      await renderBarColors({ strength: "weak", color: "#EF4444" }),
    ).toEqual(["#EF4444", "#EF444430", "#EF444430"]);
  });
});
