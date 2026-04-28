import { mergeAttributes } from "@tiptap/core";
import ImageResize from "tiptap-extension-resize-image";

function applyFloat(dom, float) {
    const f = float || "none";
    if (f !== "none") {
        dom.style.float = f;
        dom.style.margin = f === "left" ? "4px 20px 12px 0" : "4px 0 12px 20px";
        dom.style.maxWidth = "45%";
        dom.style.paddingRight = "";
        dom.style.paddingLeft = "";
    } else {
        dom.style.float = "";
        dom.style.margin = "";
        dom.style.maxWidth = "";
    }
}

export const FloatResizeImage = ImageResize.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            float: {
                default: "none",
                parseHTML: el => el.getAttribute("data-float") || "none",
            },
        };
    },
    addNodeView() {
        const parentFactory = this.parent?.();
        return (props) => {
            const nodeView = parentFactory?.(props);
            if (nodeView?.dom) applyFloat(nodeView.dom, props.node.attrs.float);
            return nodeView;
        };
    },
    renderHTML({ HTMLAttributes }) {
        const { float, containerStyle, wrapperStyle, ...rest } = HTMLAttributes;
        const f = float || "none";
        const floatStyle = f === "left"  ? "float:left;margin:4px 20px 12px 0;max-width:45%;"
                         : f === "right" ? "float:right;margin:4px 0 12px 20px;max-width:45%;"
                         : "";
        return ["img", mergeAttributes(rest, {
            "data-float": f,
            ...(floatStyle ? { style: floatStyle } : {}),
        })];
    },
    addCommands() {
        return {
            ...this.parent?.(),
            setImageFloat: (float) => ({ commands }) =>
                commands.updateAttributes(this.name, { float }),
        };
    },
}).configure({ inline: true });
