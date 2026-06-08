import type { MdSwitch } from "@material/web/switch/switch.js";

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "md-switch": React.DetailedHTMLProps<React.HTMLAttributes<MdSwitch>, MdSwitch>;
    }
  }
}
